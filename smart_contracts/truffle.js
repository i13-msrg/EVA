var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "depth then fine drop flame away use exit sustain evil spray sphere";

module.exports = {
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/<infura_api_key_here>")
      },
      network_id: 3,
      gas: 4600000
    }   
  }
};