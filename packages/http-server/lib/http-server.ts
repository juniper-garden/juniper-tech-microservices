require('dotenv').config('../.env')
console.log('process.env', process.env.POSTGRES_URI);

import { SensorReading, DB } from '@juniper/db';
function httpServer() {
    
    SensorReading.findAll().then(function (sensorReadings: any) {
        console.log(sensorReadings);
    });
}


httpServer()