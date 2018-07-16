const ethers = require('ethers');
const WebSocket = require('ws');
const moment = require('moment');

// Hardcoded stuff, that should be configurable or computable in the future
const localMatlabPort = 30000;
const precision = 4;
const default_reward = 2.40;
//const timeout = 120000;	// 20 min.
const timeout = 3600000;	// 1h

// Ethereum Wallet
const eth_wallet = ethers.Wallet.fromMnemonic("depth then fine drop flame away use exit sustain evil spray sphere");
eth_wallet.provider = new ethers.providers.InfuraProvider('ropsten', '<infura_api_key_here>');

// Initialize Ethereum Contract
var aggregatorContractABI =
[
	{
		"constant": true,
		"inputs": [],
		"name": "getMyEnergyRequirements",
		"outputs": [
			{
				"components": [
					{
						"name": "id",
						"type": "uint16"
					},
					{
						"name": "start",
						"type": "uint32"
					},
					{
						"name": "end",
						"type": "uint32"
					},
					{
						"name": "energyAmount",
						"type": "uint16"
					}
				],
				"name": "",
				"type": "tuple[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "deregisterProfile",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "retrieveMyCurrentSchedule",
		"outputs": [
			{
				"components": [
					{
						"name": "reqId",
						"type": "uint16"
					},
					{
						"name": "reward",
						"type": "uint32"
					},
					{
						"name": "allocatedChargingSlots",
						"type": "uint32[96]"
					}
				],
				"name": "schedule",
				"type": "tuple"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint16"
			}
		],
		"name": "energyRequirements",
		"outputs": [
			{
				"name": "id",
				"type": "uint16"
			},
			{
				"name": "start",
				"type": "uint32"
			},
			{
				"name": "end",
				"type": "uint32"
			},
			{
				"name": "energyAmount",
				"type": "uint16"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"components": [
					{
						"name": "reqId",
						"type": "uint16"
					},
					{
						"name": "reward",
						"type": "uint32"
					},
					{
						"name": "allocatedChargingSlots",
						"type": "uint32[96]"
					}
				],
				"name": "newSchedules",
				"type": "tuple[]"
			}
		],
		"name": "storeSchedule",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "schedules",
		"outputs": [
			{
				"name": "reqId",
				"type": "uint16"
			},
			{
				"name": "reward",
				"type": "uint32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "start",
				"type": "uint32"
			},
			{
				"name": "end",
				"type": "uint32"
			},
			{
				"name": "energyAmount",
				"type": "uint16"
			}
		],
		"name": "newEnergyRequirement",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "make",
				"type": "string"
			},
			{
				"name": "model",
				"type": "string"
			},
			{
				"name": "batterySize",
				"type": "uint8"
			}
		],
		"name": "registerProfile",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "energyRequirementIdsForNextSchedule",
		"outputs": [
			{
				"name": "",
				"type": "uint16"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getProfile",
		"outputs": [
			{
				"components": [
					{
						"name": "make",
						"type": "string"
					},
					{
						"name": "model",
						"type": "string"
					},
					{
						"name": "batterySize",
						"type": "uint8"
					}
				],
				"name": "profile",
				"type": "tuple"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getEnergyRequirementsForNextSchedule",
		"outputs": [
			{
				"components": [
					{
						"name": "id",
						"type": "uint16"
					},
					{
						"name": "start",
						"type": "uint32"
					},
					{
						"name": "end",
						"type": "uint32"
					},
					{
						"name": "energyAmount",
						"type": "uint16"
					}
				],
				"name": "",
				"type": "tuple[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "sender",
				"type": "address"
			},
			{
				"components": [
					{
						"name": "make",
						"type": "string"
					},
					{
						"name": "model",
						"type": "string"
					},
					{
						"name": "batterySize",
						"type": "uint8"
					}
				],
				"indexed": false,
				"name": "profile",
				"type": "tuple"
			}
		],
		"name": "EvProfileRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "sender",
				"type": "address"
			},
			{
				"components": [
					{
						"name": "id",
						"type": "uint16"
					},
					{
						"name": "start",
						"type": "uint32"
					},
					{
						"name": "end",
						"type": "uint32"
					},
					{
						"name": "energyAmount",
						"type": "uint16"
					}
				],
				"indexed": false,
				"name": "newReq",
				"type": "tuple"
			}
		],
		"name": "NewEnergyRequirement",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "NewSchedule",
		"type": "event"
	}
]
;
var aggregatorContractAddress = '0x90c4034d6a512a0164e4b43a0a4005b1bfd15c6d'
var aggregatorContract = new ethers.Contract(aggregatorContractAddress, aggregatorContractABI, eth_wallet);

// Helper
function momentToIntervals(start, end) {
	var result = [];
  
	// Calculate min & max
	let current = moment(start);
	if (start.hours() > 12) current.hours(12).minutes(0).seconds(0).milliseconds(0);
	else current.subtract(1, 'day').hours(12).minutes(0).seconds(0).milliseconds(0);
	let max = moment(current).add(1, 'day');

	while (current < start) {
	  result.push(0)
	  current.add(15, 'minutes');
	}
  
	while (current < end) {
	  result.push(1)
	  current.add(15, 'minutes');
	}
  
	while (current < max) {
		result.push(0);
		current.add(15, 'minutes');
	}
  
	return result;
}

var executing;
var executeScheduleComputation = module.exports.executeScheduleComputation = function () {
    if (executing) {
        console.log('Schedule computation already running! Please wait for it to finish...');
        return 3;
    }

    console.log('Schedule computation started!');
	executing = true;
	var timeoutObj;

    console.log('Connecting to Matlab EV ADMM Service...');
    var ws = new WebSocket('ws://localhost:' + localMatlabPort);
    console.log('EV ADMM Service connected!');    

	console.log('Retrieving energy requirements from Blockchain...');
	var reqIds = [];
    aggregatorContract.getEnergyRequirementsForNextSchedule().then(function(result, error) {
        if(!error) {
            console.log('Successfully retrieved all current requirements!');    

            // Data Transfer Object, a Matrix of all vehicles (energy req + parked time) as a vector with concatenated columns
            var dto = [];
            result.forEach(function(req) {
                reqIds.push(req.id);
                dto.push(req.energyAmount);
                dto.push(...momentToIntervals(moment.unix(req.start), moment.unix(req.end)));
            });

            // Transform into Typed Array
            dto = Uint32Array.from(dto);

            // Use buffer from Typed Array for Websocket message
            console.log('Sending requirements to EV ADMM Service...');                
            ws.send(dto.buffer, function(error) {
                if (!error) {
					console.log('Successfully sent requirements to EV ADMM Service');
					
					timeoutObj = setTimeout(() => {
						console.log('Timeout waiting for response from EV ADMM Service');
						ws.close();
						executing = false;
						return 2;
					}, timeout);
                } else {
					console.error(error);
					executing = false;
					return 1;
                }
            });
        } else {
			console.error(error);
			executing = false;
			return 1;
        }
      });
    
    // Write computed schedule to Blockchain
    ws.on('message', function(result) {
		clearTimeout(timeoutObj);
        console.log('Computed Schedule received from Matlab ');

        var dto = new Float32Array(result.buffer, result.byteOffset);
        // Normalize for Solidity (Float -> Int)
        // Multiply by number of significant digits after comma and round
        var factor = Math.pow(10, precision);
        var slots = [];
        dto.forEach(function(x) {
            slots.push(Math.round(x * factor))
        });

        // Create List of Schedules from resulting matrix (represented as single-column vector)
        var schedules = [];
        for (i=0; i < reqIds.length; i++) {
            var new_schedule = {
                reqId: reqIds[i],
                reward: default_reward * 100,
                allocatedChargingSlots: slots.slice(i * 96, (i + 1) * 96)
            };
            schedules.push(new_schedule);
        }

        // Write Schedules to Blockchain and wait for transaction to be mined
        console.log('Writing new schedule to Blockchain...');            
		aggregatorContract.storeSchedule(schedules, {gasLimit: 7600000})
			.then(tx => eth_wallet.provider.waitForTransaction(tx.hash))
			.then(() => console.log('Successfully written new schedule to Blockchain!'))
			.catch(err => {
				console.error(err);
				executing = false;		
				return 1;
			});

        // Close Socket to release ressources, since we are not expecting anything until next run
		ws.close();
		executing = false;
		return 0;
    });
}

// Exports
module.exports.aggregatorContractInfo = [aggregatorContractAddress, aggregatorContractABI];