const ethers = require('ethers');

const wallets = require('./wallets.js');
const dc = require('./datacollection.js');

const sema = require('async-sema');

// Constants
var defaultDeployGasLimit = module.exports.defaultDeployGasLimit = 4600000;
var defaultEvalGasLimit = module.exports.defaultEvalGasLimit = 1000000;
var defaultEvalGasPrice = module.exports.defaultEvalGasPrice = 50000000000;

// Helpers
module.exports.helpers = {};
var randomNumber = module.exports.helpers.randomNumber = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var randomNumberSet = module.exports.helpers.randomNumberSet = function(size, min, max) {
    var rns = [];
    for(let i = 0; i < size; i++) {
        var number = randomNumber(min, max);
        while(rns.includes(number)) {
            number = randomNumber(min, max);
        }
        rns.push(number);
    }
    return rns;
}

var lock = new sema(1);
var nonceStorage = [];
async function retrieveNonce(wallet) {
    await lock.acquire();
    var nonce;
    if (!nonceStorage[wallet.address]) {
        nonce = await wallet.getTransactionCount();
    } else {
        nonce = nonceStorage[wallet.address];
    }
    nonceStorage[wallet.address] = nonce + 1;
    lock.release();
    // console.log("Nonce for %s: %s", wallet.address, nonce);     
    return nonce;
}

var handleError = module.exports.handleError = function(err) {
    return;
    console.log("Error: %s", err.toString());    
    if (err.originalError) console.log("Original Error: %s", err.originalError); 
    if (err.responseText) console.log("Response Text: %s", err.responseText); 

    // Ignore some errors (TIMEOUT)
    if(err.responseText && err.responseText.includes("ETIMEDOUT")) return;

    console.log("Aborting...");
    process.exit(1);
}

// Performance Profiling
function pp(promise) {
    return new Promise(function(resolve, reject) {
        hrtime_start = process.hrtime();
        promise.then(tx => {
            tx.pp_time = process.hrtime(hrtime_start);
            resolve(tx);
        }).catch(err => {
            reject(err);
        })
    });
}

// Evaluation Functions
var masterContract;
function getMasterContract(contractInfo) {
    if(!masterContract) {
        masterContract = new ethers.Contract(contractInfo.address, contractInfo.abi, wallets.getMasterWallet());
    }
    return masterContract;
}

async function deployContract(data_collector, contractInfo, evalGasLimit = defaultDeployGasLimit, evalGasPrice = defaultEvalGasPrice) {
    var deployTransaction = ethers.Contract.getDeployTransaction(contractInfo.bytecode, contractInfo.abi);
    deployTransaction.gasLimit = evalGasLimit;
    deployTransaction.gasPrice = evalGasPrice;
    deployTransaction.nonce = await retrieveNonce(wallets.getMasterWallet());

    try {
        let tx = await wallets.getMasterWallet().sendTransaction(deployTransaction)
        .then(tx => pp(wallets.provider.waitForTransaction(tx.hash)))
        .catch(handleError);
    
        let tr = await wallets.provider.getTransactionReceipt(tx.hash)

        data_collector.collect("deployContract", {hash: tx.hash, time: tx.pp_time, gasUsed: tr.gasUsed})
        return tr;

    } catch (err) {
        handleError(err)
    }
}

function sampleParticipants(contractInfo) {
    return randomNumberSet(randomNumber(2, wallets.getEvalWallets().length - 1), 0, wallets.getEvalWallets().length - 1)
            .map(x => wallets.getEvalWallets()[x])
            .map(wallet => new ethers.Contract(contractInfo.address, contractInfo.abi, wallet));
}

function evalMasterContractCall(data_collector, masterContract, functionName, contractArgs, evalGasLimit = defaultEvalGasLimit, evalGasPrice = defaultEvalGasPrice) {
    let buildArgs = contractArgs ? opts => [...contractArgs, opts] : opts => [opts];
    var promise = masterContract[functionName](...buildArgs({nonce: retrieveNonce(masterContract.signer), gasLimit: evalGasLimit, gasPrice: evalGasPrice}))
        .then(tx => pp(wallets.provider.waitForTransaction(tx.hash)))
        .catch(handleError);

    promise.then(tx => 
        wallets.provider.getTransactionReceipt(tx.hash).then(tr => 
            data_collector.collect(functionName, {
                hash: tx.hash, 
                time: tx.pp_time, 
                gasUsed: tr.gasUsed
            })
        )
    );

    return promise;
}

function evalParticipantsContractCall(data_collector, participantContracts, functionName, contractArgs, evalGasLimit = defaultEvalGasLimit, evalGasPrice = defaultEvalGasPrice) {
    let buildArgs = contractArgs ? opts => [...contractArgs, opts] : opts => [opts];
    var promises = Promise.all(participantContracts.map(contract => contract[functionName](...buildArgs({nonce: retrieveNonce(contract.signer), gasLimit: evalGasLimit, gasPrice: evalGasPrice}))
        .then(tx => pp(wallets.provider.waitForTransaction(tx.hash)))
        .catch(handleError)));

    promises.then(txs => txs.forEach(tx => 
        wallets.provider.getTransactionReceipt(tx.hash).then(tr => 
            data_collector.collect(functionName, {
                hash: tx.hash, 
                time: tx.pp_time, 
                gasUsed: tr.gasUsed
            })
        )
    ));

    return promises;
}

var evalContractCall = module.exports.evalContractCall = function(data_collector, contracts, functionName, contractArgs, evalGasLimit = defaultEvalGasLimit, evalGasPrice = defaultEvalGasPrice) {
    // Master Contract
    if (contracts.signer && contracts.signer === wallets.getMasterWallet())
        return evalMasterContractCall(data_collector, contracts, functionName, contractArgs, evalGasLimit, evalGasPrice);
    // Participant Contracts
    if (Array.isArray(contracts) && contracts[0].signer && contracts[0].signer.constructor === wallets.getEvalWallets()[0].constructor)
        return evalParticipantsContractCall(data_collector, contracts, functionName, contractArgs, evalGasLimit, evalGasPrice);

    // Contract type not recognized
    handleError("evalContractCall: Invalid contract type in parameter \"contracts\"");
}

module.exports.runExperiment = async function (simName, data_collector, masterContract, participantContracts, evalGasPrice = defaultEvalGasPrice) {
    // Override this in Experiments
    console.log("Info: No Experiment defined!");
    process.exit(0);
}

var runSimulationRound = async function (simName, data_collector, contractInfo, evalGasPrice = defaultEvalGasPrice) {
    // Randomly select participants (at least 3) and instantiate Contracts   
    console.log("Simulation %s: Random sampling participants from evaluation wallets...", simName);    
    var participantContracts = sampleParticipants(contractInfo);
    console.log("Simulation %s: Num. Participants: %s", simName, participantContracts.length);

    // Run the Experiment
    return await module.exports.runExperiment(simName, data_collector, getMasterContract(contractInfo), participantContracts, evalGasPrice)
}

async function runSimulation(data_collector, contractInfo, simNumber, numRounds = 2, evalGasPrice = defaultEvalGasPrice) {
    console.log("Simulation %s Aggregator is at: %s", simNumber, contractInfo.name, contractInfo.address);
    for (let i = 1; i < numRounds + 1; i++) {
        simName = simNumber + "." + i;
        console.log("Simulation Round %s starting...", simName);
        if (await runSimulationRound(simName, data_collector, contractInfo, evalGasPrice))
            console.log("Simulation Round %s finished successfully!", simName);
        else
            console.log("Simulation Round %s failed!", simName);        
    }
}

var runEvaluation = module.exports.runEvaluation = async function (contractInfo, name = "evaluation", numSimulations = 2, numRounds = 3, evalGasPrice = defaultEvalGasPrice) {
    console.log("Running evaluation with %s parallel Simulations and %s rounds per Simulation...", numSimulations, numRounds);
    
    // Initialize Evaluation Wallets
    wallets.getMasterWallet();
    wallets.getEvalWallets();

    // Initialize Data Collector    
    var data_collector = new dc(name + '.' + Date.now() + '.csv');
    
    for(let i = 1; i < numSimulations + 1; i++) {
        console.log("Deploying smart contract for Simulation %s...", i);
        var tr = await deployContract(data_collector, contractInfo);
        runSimulation(data_collector, {name: contractInfo.name, address: tr.contractAddress, abi: contractInfo.abi}, i, numRounds, evalGasPrice);
    }
}