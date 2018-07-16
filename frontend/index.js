//var formatT = 'DD/MM/YYYY HH:mm';
var formatT = 'ddd DD MMMM,  YYYY HH:mm';
var minDateT = moment();
if (minDateT.hours() >= 12) {
  minDateT.add(1, 'day').hours(12).minutes(0).seconds(0).milliseconds(0);
}
minDateT.hours(12).minutes(0).seconds(0).milliseconds(0);
var maxDateT = moment(minDateT).add(1, 'day').hours(12).minutes(0).seconds(0).milliseconds(0);


// DateTime Picker's
$('#from').datetimepicker({
  useCurrent: false,
  stepping: 15, 
  date: minDateT,
  minDate: minDateT,
  maxDate: maxDateT,
  icons: {
    time: "fa fa-clock-o",
    date: "fa fa-calendar",
    up: "fa fa-chevron-up",
    down: "fa fa-chevron-down",
    previous: 'fa fa-chevron-left',
    next: 'fa fa-chevron-right',
    today: 'fa fa-screenshot',
    clear: 'fa fa-trash',
    close: 'fa fa-remove'
  },
  format : formatT
});

$('#to').datetimepicker({
  useCurrent: false,
  stepping: 15,
  date: maxDateT,
  minDate: minDateT,
  maxDate: maxDateT,
  icons: {
    time: "fa fa-clock-o",
    date: "fa fa-calendar",
    up: "fa fa-chevron-up",
    down: "fa fa-chevron-down",
    previous: 'fa fa-chevron-left',
    next: 'fa fa-chevron-right',
    today: 'fa fa-screenshot',
    clear: 'fa fa-trash',
    close: 'fa fa-remove'
  },
  format : formatT
});

$("#from").on("dp.change", function (e) {
  $('#to').data("DateTimePicker").minDate(e.date);
});


// Scheduling Chart
var areaChartCanvas = document.getElementById("myChart").getContext('2d');
var areaChartData = {
  labels  : ["12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:00", "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00", "20:15", "20:30", "20:45", "21:00", "21:15", "21:30", "21:45", "22:00", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45", "00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00", "02:15", "02:30", "02:45", "03:00", "03:15", "03:30", "03:45", "04:00", "04:15", "04:30", "04:45", "05:00", "05:15", "05:30", "05:45", "06:00", "06:15", "06:30", "06:45", "07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45"],  
 datasets: [
    {
      label               : 'EVA schedule',
      backgroundColor     : 'rgba(255, 99, 132, 0.2)',
      borderColor         : 'rgba(255,99,132,1)',
      showXLabels         : 4,
      data                : []
    },
    {
      label               : 'unregulated charging',
      backgroundColor     : 'rgba(54, 162, 235, 0.2)',
      borderColor         : 'rgba(54, 162, 235, 1)',
      showXLabels         : 4,
      data                : []
    }
  ]
}

var areaChartOptions = {
  //Boolean - If we should show the scale at all
  showScale               : true,
  //Boolean - Whether grid lines are shown across the chart
  scaleShowGridLines      : false,
  //String - Colour of the grid lines
  scaleGridLineColor      : 'rgba(0,0,0,.05)',
  //Number - Width of the grid lines
  scaleGridLineWidth      : 1,
  //Boolean - Whether to show horizontal lines (except X axis)
  scaleShowHorizontalLines: true,
  //Boolean - Whether to show vertical lines (except Y axis)
  scaleShowVerticalLines  : true,
  //Boolean - Whether the line is curved between points
  bezierCurve             : true,
  //Number - Tension of the bezier curve between points
  bezierCurveTension      : 0.3,
  //Boolean - Whether to show a dot for each point
  pointDot                : false,
  //Number - Radius of each point dot in pixels
  pointDotRadius          : 4,
  //Number - Pixel width of point dot stroke
  pointDotStrokeWidth     : 1,
  //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
  pointHitDetectionRadius : 20,
  //Boolean - Whether to show a stroke for datasets
  datasetStroke           : true,
  //Number - Pixel width of dataset stroke
  datasetStrokeWidth      : 2,
  //Boolean - Whether to fill the dataset with a color
  datasetFill             : true,
  //String - A legend template
  legendTemplate          : '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].lineColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
  //Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
  maintainAspectRatio     : true,
  //Boolean - whether to make the chart responsive to window resizing
  responsive              : true
}
var areaChart       = new Chart(areaChartCanvas, {

    type: 'line',
    data: areaChartData,
    options: areaChartOptions
});

// Smart Contract stuff
var provider;
var signer;
var aggregatorContract;
var myEnergyRequirements = [];

window.addEventListener('load', function() {
  if (web3 == undefined) {
    console.log("Unsupported Browser! Please run in MetaMask or other DAPP Browser.")
  }
  else {
    provider = new ethers.providers.Web3Provider(web3.currentProvider);
    signer = provider.getSigner();

    console.log(signer);
    console.log(provider);
  }

  // HACK to load stuff from the Blockchain after init
  initializeContracts();
  loadEVProfile();
});

function initializeContracts() {

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
  aggregatorContract = new ethers.Contract('0x90c4034d6a512a0164e4b43a0a4005b1bfd15c6d', aggregatorContractABI, signer);

  // New Energy Requirement persisted -> Show in DAPP
  aggregatorContract.onnewenergyrequirement = function(sender, newReq) {
    console.log("sender: " + sender + "    " + "req: " + newReq)
    signer.getAddress().then(function(addr) {
      if(sender == addr) {
        $("#loader-req").hide();
        console.log(newReq);
        addEnergyRequirement
      (newReq);
      }
    });   
  }

  // EV Profile saved -> unlock DAPP
  aggregatorContract.onevprofileregistered = function(sender, profile) {
    console.log("sender: " + sender + "    " + "profile: " + profile)
    signer.getAddress().then(function(addr) {
      if(sender == addr) {
        setEVProfile(profile);
        $("#loader-car").hide();
        console.log(profile);
      }
    });   
  }

  // New Schedule -> refresh schedule data
  aggregatorContract.onnewschedule = function() {
    console.log("New Schedule!");
    readSchedule();
  }
}


function loadEVProfile() {
  $("#nav_req").addClass("disabled disabled-link");
  $("#nav_sched").addClass("disabled disabled-link");  
  $("#loader-car").show();
  aggregatorContract.getProfile().then(function(result, error) {
    if(!error) {
      console.log(result);

      if (result.make && result.model && result.batterySize !== 0) {
        setEVProfile(result); 
      }
      

      $("#loader-car").hide();
    }
    else {
      console.error(error);
      $("#loader-car").hide();      
    }
  });
}

function registerEV(inputBrand, inputModel, inputBattery) {
  $("#loader-car").show();
  console.log(inputBrand + " " + inputModel + " " + inputBattery);
  aggregatorContract.registerProfile(inputBrand, inputModel, inputBattery).then(function(result, error){
    if(!error) {
      console.log(result);
      //$("#loader-car").hide();      
    }
    else {
      console.error(error);
      $("#loader-car").hide();      
    }
  });
}

function deregisterEV() {
  aggregatorContract.deregisterProfile().then(function(result, error){
    if(!error) {
      console.log(result);
    }
    else {
      console.error(error);
    }
  });
}

function setEVProfile(profile) {
  $("#inputBrand").val(profile.make);
  $("#inputModel").val(profile.model);
  $("#inputBattery").val(profile.batterySize);

  readRequests();
  readSchedule();
}


function newRequest(from, to, energy) {
  console.log(from + " " + to + " " + energy);
  $("#loader-new-req").show();

  var start = moment(from, formatT);
  var end = moment(to, formatT);

  aggregatorContract.newEnergyRequirement(start.unix(), end.unix(), energy).then(function(result, error) {
    if(!error) {
      console.log(result);
      $("#loader-new-req").hide();
      $('#newRequirementModal').modal('hide')
      $("#loader-req").show();
    }
    else {
      $("#loader-new-req").hide();            
      console.error(error);
    }
  });
}


function readRequests() {
  $("#loader-req").show();
  aggregatorContract.getMyEnergyRequirements().then(function(result, error){
    if(!error) {
      console.log(result);

      var upcomingNode = document.getElementById("upcoming");
      while (upcomingNode.firstChild) {
        upcomingNode.removeChild(upcomingNode.firstChild);
      }

      var pastNode = document.getElementById("past");
      while (pastNode.firstChild) {
        pastNode.removeChild(pastNode.firstChild);
      }

      $("#loader-req").hide();
      $("#nav_req").removeClass("disabled  disabled-link");
  

      result.forEach(function(energyRequirement) {
        console.log(energyRequirement);
        addEnergyRequirement(energyRequirement);
      });

    
    }
    else {
      console.error(error);
      $("#loader-req").hide();      
    }
  });
  
  
}

function readSchedule() {
  $("#loader-sched").show();
  aggregatorContract.retrieveMyCurrentSchedule().then(function(result, error) {
    if(!error) {
      console.log(result);

      // Detect empty schedule 
      if (result.reqId == 0 && result.reward == 0 && result.allocatedChargingSlots.every(x => x == 0)) {
        $("#loader-sched").hide();
        return;
      }

      var req = myEnergyRequirements.find(x => x.id == result.reqId);

      // Calculate start of scheduling cycle
      let date = moment.unix(req.start);
      if (date.hours() > 12) date.hours(12).minutes(0).seconds(0).milliseconds(0);
      else date.subtract(1, 'day').hours(12).minutes(0).seconds(0).milliseconds(0);

      // Chart
      areaChart.data.datasets[0].data = result.allocatedChargingSlots.map(x => x/10000);
      areaChart.data.datasets[1].data = calculateUnsupervisedChargingSlots(moment.unix(req.start), req.energyAmount);
      areaChart.update();


      // Table
      var start, end;
      [start, end] = intervalsToMoment(date, result.allocatedChargingSlots);

      $("#sched_date").html(start.format('ddd DD MMMM,  YYYY'));
      $("#sched_start").html(start.format('HH:mm'));
      $("#sched_end").html(end.format('HH:mm'));
      $("#sched_energy").html(Math.round(result.allocatedChargingSlots.map(x => x/10000).reduce((a, b) => a + b, 0)) + " kWh");
      $("#sched_reward").html(parseFloat(result.reward / 100).toFixed(2) + " €");
      
      

      $("#loader-sched").hide();
      $("#nav_sched").removeClass("disabled  disabled-link");
  
    }
    else {
      console.error(error);
      $("#loader-sched").hide();
      $("#nav_sched").addClass("disabled  disabled-link");
    }
  });
}

function addEnergyRequirement(newReq) {
  myEnergyRequirements.push(newReq);

  var start = moment.unix(newReq.start);
  var end = moment.unix(newReq.end)
  var dateString;
  if (start.isValid() && end.isValid()) {
    dateString = start.format(formatT) + " - " + end.format(formatT);
  } else {
    dateString = "Invalid Date";
  }
  
  var tr = document.createElement("TR");

  var td1 = document.createElement("TD");
  var td2 = document.createElement("TD");
  var td3 = document.createElement("TD");
  var startdate = document.createTextNode(start.format(formatT));
  td1.appendChild(startdate);
  tr.appendChild(td1);
  var endDate = document.createTextNode(end.format(formatT));
  td2.appendChild(endDate);
  tr.appendChild(td2);
  var kwhNode = document.createTextNode(newReq.energyAmount);
  td3.appendChild(kwhNode);
  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  console.log("---------------");
  console.log(tr);

  // Calculate start of scheduling cycle
  let cycleStart = moment(start);
	if (cycleStart.hours() > 12) cycleStart.hours(12).minutes(0).seconds(0).milliseconds(0);
	else cycleStart.subtract(1, 'day').hours(12).minutes(0).seconds(0).milliseconds(0);

  if (cycleStart > moment()) {
    document.getElementById("upcoming").appendChild(tr);
  } else {
    document.getElementById("past").appendChild(tr);
  }
}



function momentToIntervals(start, end) {
  //start.minutes(Math.ceil(start.minutes() / 15) * 15);
  //end.minutes(Math.ceil(end.minutes() / 15) * 15);

  var result = [];

  var current = moment(minDateT);
  while (current < start) {
    result.push(0)
    current.add(15, 'minutes');
  }

  while (current < end) {
    result.push(1)
    current.add(15, 'minutes');
  }

  while (current < maxDateT) {
      result.push(0);
      current.add(15, 'minutes');
  }

  return result;
}


function intervalsToMoment(date, intervals) {
  var start = moment(date);

  var i = 0;
  while (intervals[i] == 0) {
    start.add(15, 'minutes');
    i++;
  }

  var end = moment(start);
  while (intervals[i] != 0 && i < 96) {
    end.add(15, 'minutes');
    i++;
  }

  while (intervals[i] == 0) {
    i++;
  }

  if (i == 96) {
    return [start, end];
  } else {
    return [moment.invalid(), moment.invalid()];
  }
}


function calculateUnsupervisedChargingSlots(start, totalAllocatedEnergy) {
  // From EV ADMM algorithm: 16 kWh / h from the beginning until charged (upper bound)

  // Calculate start of scheduling cycle
  let current = moment(start);
	if (start.hours() > 12) current.hours(12).minutes(0).seconds(0).milliseconds(0);
  else current.subtract(1, 'day').hours(12).minutes(0).seconds(0).milliseconds(0);

  var unsupervisedChargingSlots = [];
  while (current < start) {
    unsupervisedChargingSlots.push(0)
    current.add(15, 'minutes');
  }

  // Charge from the moment the car is plugged in until it is charged with max. power (4 kWh / timeslot)
  // since there is no regulation on the socket
  var n = Math.ceil(totalAllocatedEnergy / 4);  
  for (i = 0; i < n; i++) {
    unsupervisedChargingSlots.push(4)
  }

  var end = 96 - unsupervisedChargingSlots.length;
  for (i = 0; i < end; i++) {
    unsupervisedChargingSlots.push(0);
  }

  return unsupervisedChargingSlots;
  
}


async function verifyComputations() {
  $("#verify_icon").removeClass("fa-question-circle")
  $("#verify_icon").addClass("fa-spinner fa-spin");
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  $("#verify_icon").removeClass("fa-spinner fa-spin")
  $("#verify_icon").addClass("fa-check-circle");
  $("#verify_btn").removeClass("btn-outline-primary");
  $("#verify_btn").addClass("btn-outline-success");
}