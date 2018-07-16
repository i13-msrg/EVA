const sim = require('./simulation');
const aggregator = require('../smart_contracts/build/contracts/Aggregator.json');


// Test Data Generators
function generateEvProfile() {
    return ["BMW", "i3", 33];
}

function generateEnergyRequirement() {
    // Today 10:00 - 20:00
    var start = Math.round((new Date()).setHours(10, 0, 0, 0) / 1000);
    var end = Math.round((new Date()).setHours(20, 0, 0, 0) / 1000);

    // Energy amount max 0.25 kWh per hour
    var energyAmount = sim.helpers.randomNumber(7, 42);

    return [start, end, energyAmount];
}

function generateSchedule(numParticipants) {
    let chargingSlots = []

    for(let i = 0; i < sim.helpers.randomNumber(1, 32); i++) {
        chargingSlots.push(0);
    }
    for(let i = 0; i < sim.helpers.randomNumber(8, 44); i++) {
        chargingSlots.push(sim.helpers.randomNumber(1, 40000));
    }
    let end = 96 - chargingSlots.length;
    for(let i = 0; i < end; i++) {
        chargingSlots.push(0);
    }

    let schedules = [];
    for (var i = 0; i < numParticipants; i++) {
        var new_schedule = {
            reqId: sim.helpers.randomNumber(1, 20000),
            reward: 4200,
            allocatedChargingSlots: chargingSlots,
        };
        schedules.push(new_schedule);
    }
    return schedules;
}


sim.runExperiment = async function (simName,  data_collector, masterContract, participantContracts, evalGasPrice = defaultEvalGasPrice) {
    // Register Profiles for each participant and wait for transactions to be mined
    console.log("Simulation %s: Registering EV profiles for each participant...", simName);
    await sim.evalContractCall(data_collector, participantContracts, 'registerProfile', generateEvProfile());

    // Submit energy requirements for each participant and wait for transactions to be mined
    console.log("Simulation %s: Submitting energy requirements for each participant...", simName);
    await sim.evalContractCall(data_collector, participantContracts, 'newEnergyRequirement', generateEnergyRequirement());
    
    // Evaluate Schedule Computation (storeSchedule)
    console.log("Simulation %s: Storing schedule...", simName);
    await sim.evalContractCall(data_collector, masterContract, 'storeSchedule', [generateSchedule(participantContracts.length)], 4700000);

    // Sometimes Deregister Profiles for every participant (20% of rounds)
    if(sim.helpers.randomNumber(1, 5) == 1) {
        console.log("Simulation %s: Deleting EV profiles for each participant...", simName);
        await sim.evalContractCall(data_collector, participantContracts, 'deregisterProfile');
    }

    // Done
    return true;
}

// Execute the Simulation on Startup
// Usage: -s numSimulations, -r numRounds per Sim., --gas=<custom Gas Price in wei>
var argv = require('minimist')(process.argv.slice(2));
let contract = {name: aggregator.contractName, abi: aggregator.abi, bytecode: aggregator.bytecode};
 
sim.runEvaluation(
contract,                       // Smart Contract Data
"experiment.eva_luation",       // Experiment Name (optional, default = "evaluation")
argv.s,                         // Number of parallel simulations (optional, default = 2)
argv.r,                         // Number of rounds per simulation (optional, default = 3)
argv.gas);                      // Custom gas limit (optional, default = 50gwei)