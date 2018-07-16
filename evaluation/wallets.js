const ethers = require('ethers');

// Constants
const ETH_WEI = 1000000000000000000;

// Ropsten via Infura
var provider = module.exports.provider = new ethers.providers.InfuraProvider('ropsten', '<infura_api_key_here>');

// Master Account
var masterMnemonic = "depth then fine drop flame away use exit sustain evil spray sphere";

// List of Test Accounts with Test Ether (Participants)
var evalMnemonics = [
    "bulb ask truly venue battle plunge sad ostrich fan piano battle notable",
    "harbor genuine below enroll furnace actress topple cable cereal aim leisure acid",
    "junk happy convince virtual seven tonight prosper quality track loop because dwarf",
    "onion return excuse cash foam need broom hamster oval pyramid spatial damp",
    "mimic again mother wedding cherry aisle cluster siren bench sight oyster mango",
    "into wink jar river amount salt eight wave review mercy snake month",
    // "screen ranch manage gun always today fiber shiver arrange require brass bright",
    // "uncle payment escape measure jewel glue magic reason social crumble half depth",
    // "mansion inner swap cricket mystery announce actress guard obvious helmet height length",
    // "enrich polar peanut inquiry danger drip camp spike address wing planet uniform",
    // "undo face wasp success inmate claw crop insane major explain amount much",
    // "keen pilot door prosper penalty name buyer unfold cupboard invest jar scan",
    // "attend usual invest any dust crop error face slice behave pigeon life",
    // "visual street april essence engage juice welcome sweet kidney scout dynamic junior",
    // "auto acoustic topic sun school antique punch invest usual code faint avoid",
    // "service skull owner tool vendor green speed hello ticket nerve will silly",
    // "clock wise world fly possible food isolate curious turkey combine wine copper",
    // "cup inspire there patch foster hamster minute image volume best window insect",
    // "cherry gallery fuel brick movie utility when turkey truck chuckle inform steak",
    "duty eight street meat elephant used idle napkin alter length deposit awful"
]

var masterWallet;
var getMasterWallet = module.exports.getMasterWallet = function () {
    if(!masterWallet) {
        console.log("Generating master wallet from mnemonic...");
        masterWallet = ethers.Wallet.fromMnemonic(masterMnemonic);
        masterWallet.provider = provider;
    }
    return masterWallet
}

var evalWallets;
var getEvalWallets = module.exports.getEvalWallets = function () {
    if(!evalWallets) {
        console.log("Generating evaluation wallets from mnemonic list...")
        evalWallets = evalMnemonics.map(mnemonic => {
            var wallet = ethers.Wallet.fromMnemonic(mnemonic)
            wallet.provider = provider;
            return wallet;
        });
    }
    return evalWallets;
}

// Setup
var fundWallets = module.exports.fundWallets = function (ethAmount) {
    console.log("Funding evaluation wallets from EVA Master Wallet with %s ETH...", ethAmount)
    getMasterWallet().getTransactionCount().then(txCount => {
        getEvalWallets().forEach(wallet =>  {
            getMasterWallet().send(wallet.getAddress(), ethAmount * ETH_WEI, {nonce: txCount})
            .then(tx => console.log(wallet.getAddress().toString() + ": " + tx.hash))
            .catch(error => console.log(wallet.getAddress().toString() + ": " + error));

            txCount++;
        });
    });
}

// Helper Methods
var printEvalWallets = module.exports.printEvalWallets = function () {
    console.log("Retrieving wallet addresses and balances...")
    getEvalWallets().forEach(wallet => wallet.getBalance()
        .then(balance => console.log(wallet.getAddress().toString() + ": " + (balance / ETH_WEI).toString()))
        .catch(error => console.log(wallet.getAddress().toString() + ": " + error))
    );
}