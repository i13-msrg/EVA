// Provides Data Collection in CSV File
const fs = require('fs');
const csv = require('csv-stringify');

// Helper
function formatHrTime(hrtime) {
    let seconds = hrtime[0] + (hrtime[1] / 1e9);
    return parseFloat(Math.round(seconds * 100) / 100).toFixed(2);
}

var dc = module.exports = function(csvFileName) {
    console.log("Initializing Data Collection..."); 
    if (!csvFileName) csvFileName = 'evaluation_' + Date.now() + '.csv';

        this.csvWriter = csv({ header: true, columns: {
            'function': 'function',
            'tx': 'tx',
            'gas': 'gas',
            'time': 'time',
        }});
    
        this.csvWriter.on('error', function(err){
            console.log("Error during Data Collection: %s", err.message);
        });
    
        // this.csvWriter.pipe(process.stdout);
        this.csvWriter.pipe(fs.createWriteStream(csvFileName));
}

dc.prototype.collect = function (fName, txMeta) {
    if (!this.csvWriter) {
        console.log("WARNING: Attempt to collect data without prior initialization.");    
        initDataCollection();
    }

    // Retrieve Transaction Receipts and write execution data
    this.csvWriter.write({
        'function' : fName,
        'tx': txMeta.hash,
        'gas': txMeta.gasUsed.toString(),
        'time': formatHrTime(txMeta.time)
    });
}

dc.prototype.stop = function () {
    console.log("Stopping Data Collection and flushing buffers...");         
    this.csvWriter.end();
}