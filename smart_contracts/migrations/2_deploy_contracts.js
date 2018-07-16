var Aggregator = artifacts.require("./Aggregator.sol");

module.exports = function(deployer) {
  deployer.deploy(Aggregator);
};