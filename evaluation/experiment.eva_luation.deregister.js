const sim = require('./simulation');
const aggregatorContractInfo = require('../smart_contracts/build/contracts/Aggregator.json');


// Test Data Generators
function generateEvProfile() {
    return ["BMW", "i3", 33];
}


sim.runExperiment = async function (simName,  data_collector, masterContract, participantContracts, evalGasPrice = defaultEvalGasPrice) {
    // Register Profiles for each participant and wait for transactions to be mined
    console.log("Simulation %s: Registering EV profiles for each participant...", simName);
    await sim.evalContractCall(data_collector, participantContracts, 'registerProfile', generateEvProfile());

    // Deregister Profiles for every participant
    console.log("Simulation %s: Deleting EV profiles for each participant...", simName);
    await sim.evalContractCall(data_collector, participantContracts, 'deregisterProfile');

    // Done
    return true;
}

// Execute the Simulation on Startup
// Usage: -s numSimulations, -r numRounds per Sim., --gas=<custom Gas Price in wei>
var argv = require('minimist')(process.argv.slice(2));
sim.runEvaluation({
    name: aggregatorContractInfo.contractName,
    abi: aggregatorContractInfo.abi,
    bytecode: aggregatorContractInfo.bytecode
}, "experiment.eva_luation.deregister", argv.s, argv.r, argv.gas);