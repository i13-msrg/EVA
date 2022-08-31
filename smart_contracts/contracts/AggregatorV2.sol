// pragma solidity ^0.4.24;
// pragma experimental ABIEncoderV2;

// contract Aggregator {

//     struct EvInfo {
//         string make;
//         string model;
//         uint8 batterySize;
//     }

//     struct EnergyRequirement {
//         uint16 id;
//         uint32 start;
//         uint32 end;
//         uint16 energyAmount;
//     }

//     struct Schedule {
//         uint16 reqId;
//         uint32 reward;
//         uint32[96] allocatedChargingSlots;
//     }

//     address owner;
    
//     mapping(address => EvInfo) evProfiles;

//     mapping(uint16 => EnergyRequirement) public energyRequirements;    
//     mapping(address => uint16[]) userToEnergyRequirementIdsMap;
//     mapping(uint16 => address) energyRequirementIdToUserMap;    
//     uint16[] public energyRequirementIdsForNextSchedule;
//     uint16 energyRequirementSequence;

//     mapping(address => Schedule) public schedules;
//     address[] schedulesIndex;
    


//     constructor() public {
//         owner = msg.sender;
//         energyRequirementSequence = 0;
//     }


//     modifier onlyOwner() {
//         if(msg.sender != owner) return;
//         _;
//     }


//     // Manage Electric Vehicle Information
//     event EvProfileRegistered(address sender, EvInfo profile);

//     function registerProfile(string make, string model, uint8 batterySize) external {
//         EvInfo memory newProfile = EvInfo(make, model, batterySize);
//         evProfiles[msg.sender] = newProfile;
//         emit EvProfileRegistered(msg.sender, newProfile);
//     }

//     function deregisterProfile() external {
//         delete evProfiles[msg.sender];
//     }

//     function getProfile() external constant returns (EvInfo profile) {
//         return evProfiles[msg.sender];
//     }


//     // Manage Energy Requirements
//     event NewEnergyRequirement(address sender, EnergyRequirement newReq);

//     function newEnergyRequirement(uint32 start, uint32 end, uint16 energyAmount) external {
//         EnergyRequirement memory r = EnergyRequirement(energyRequirementSequence, start, end, energyAmount);
//         energyRequirements[energyRequirementSequence] = r;
//         userToEnergyRequirementIdsMap[msg.sender].push(energyRequirementSequence);
//         energyRequirementIdToUserMap[energyRequirementSequence] = msg.sender;
//         energyRequirementIdsForNextSchedule.push(energyRequirementSequence);
//         energyRequirementSequence++;
        
//         emit NewEnergyRequirement(msg.sender, r);
//     }

//     function getMyEnergyRequirements() external constant returns (EnergyRequirement[]) {
//         uint16[] storage myIds = userToEnergyRequirementIdsMap[msg.sender];
//         EnergyRequirement[] memory myReqs = new EnergyRequirement[](myIds.length);
//         for (uint16 i = 0; i < myIds.length; i++) {
//             myReqs[i] = energyRequirements[myIds[i]];
//         }
//         return myReqs;
//     }

//     // Schedule Computations
//     event NewSchedule();

//     function getEnergyRequirementsForNextSchedule() external constant returns (EnergyRequirement[]) {
//         EnergyRequirement[] memory nextScheduleReqs = new EnergyRequirement[](energyRequirementIdsForNextSchedule.length);
//         for (uint16 i = 0; i < energyRequirementIdsForNextSchedule.length; i++) {
//             nextScheduleReqs[i] = energyRequirements[energyRequirementIdsForNextSchedule[i]];
//         }
//         return nextScheduleReqs;
//     }

//     function storeSchedule(Schedule[] newSchedules) public onlyOwner {
//         // Empty old schedules
//         for (uint i = 0; i < schedulesIndex.length; i++) {
//             address u = schedulesIndex[i];
//             delete schedules[u];
//         }
//         delete schedulesIndex;

//         // Add new schedules
//         for (i = 0; i < newSchedules.length; i++) {
//             address user = energyRequirementIdToUserMap[newSchedules[i].reqId];
//             schedules[user] = newSchedules[i];
//             schedulesIndex.push(user);
//         }

//         // Reset Energy Requirements for next Schedule
//         delete energyRequirementIdsForNextSchedule;

//         emit NewSchedule();
//     }

//     // Schedule Retrieval (Frontend)
//     function retrieveMyCurrentSchedule() external constant returns (Schedule schedule) {
//         return schedules[msg.sender];
//     }
// }





