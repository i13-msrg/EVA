const schedule = require('node-schedule');
const eebridge = require('.evadmm_ethereum_bridge.js');

schedule.scheduleJob('0 12 * * *', function(){
    console.log('Running scheduled task for Matlab computation at %s...', new Date());
	eebridge.executeScheduleComputation();
   });