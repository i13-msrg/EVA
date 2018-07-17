# EVA: Fair and Auditable Electric Vehicle Charging Service using Blockchain

## Description
A prototypic implementation of EVA as part of my Master's Thesis.
Please find the publication here: [EVA: Fair and Auditable Electric Vehicle Charging Service using Blockchain](https://dl.acm.org/citation.cfm?id=3219776)

## Build Instructions
To build and run the prototype, you need Node.js, Matlab (with Optimization Toolbox) and an Infura API Key (https://infura.io)

### Smart Contract
* Put your Infura API Key at `<infura_api_key_here>` in `smart_contracts/truffle.js`
* cd into `smart_contracts` directory
* `npm install`
* `truffle compile`
* `truffle migrate --reset --network ropsten`

* Note the `address` where truffle deployed the contract and the ABI (in `smart_contracts/build/contracts/Aggregator.json`) for later

### EV ADMM
#### Pt. 1: Matlab
* Start Matlab
* Add MatlabWebSocket to Java Classpath
  * Execute command `edit(fullfile(prefdir,'javaclasspath.txt'))`
  * Add a new line with the path to `evadmm/matlab/matlabwebsocket/matlab-websocket-1.4.jar`
  * Save and restart Matlab
* In Matlab, add the `evadmm/matlab` folder including all subfolders to the current Matlab path
* Run `StartEvAdmmServer.m`

#### Pt.2 Ethereum Bridge
* Put your Infura API Key at `<infura_api_key_here>` in `evadmm/evadmm_ethereum_bridge.js`
* Update the variables `aggregatorContractABI` and `aggregatorContract` in `evadmm/evadmm_ethereum_bridge.js` according to the results from compilation & deployment
* cd into `evadmm` directory
* `npm install`
* `node evadmm_schedule.js`

### Frontend
* Update the variables `aggregatorContractABI` and `aggregatorContract` in `frontend/index.js` according to the results from compilation & deployment
* cd into `frontend` directory
* `npm install http-server`
* `http-server`

* You can access the DApp using any DApp browser (e.g. MetaMask) on `http://localhost:8080` now

* Alternative: Deploy files on any webserver

## Evaluation
### Preparation
* Put your Infura API Key at `<infura_api_key_here>` in `evaluation/wallets.js`
* Modify `evaluation/wallets.js` with test wallet mnemonics to your liking
* Open a Node.js console, import the `wallets.js` module and fund your test wallets using the `fundWallets` function

### Experiment Design
* Create a file `experiment.<experiment_name>.js in `evaluation`
* Import the `simulation` module and override the `runExperiment` function with your designed experiment
* For examples, take a look at `evaluation/experiment.eva_luation.js`

### Running the Evaluation
* cd into `evaluation`
* `npm install`
* `node experiment.<experiment_name>.js -s <Number of Simulations -r <Number of Rounds per Simulation`
* The results will be collected in `experiment.<experiment_name>.<timestamp>.csv`
