import JuniperCore from '@juniper-tech/core'
import { ReadingsByCustomerId, SensorReading } from './kafkaSensorRecordProcessor'
const { JuniperRedisUtils } = JuniperCore
const { SensorBuffer,  insertLatestSensorReading, fetchCustomerDeviceAlertByCustomerId} = JuniperRedisUtils

type SensorBufferParam = {
  readingsMapped: ReadingsByCustomerId,
  finalBatchResults?: SensorReading[]
}

/**
 * this piped function gets the results from sequelize in the form of a promise,
 * which we then have to unwrap or await for the result of.
 */

// TODO: Refactor
export default async function sensorBuffer(data: SensorBufferParam): Promise<any> {
  await data
  const { readingsMapped, finalBatchResults } = data

  if(!readingsMapped) return null
 
  return new Promise(async (resolve, reject) => {
      Object.keys(readingsMapped).map(async (customerDeviceId: string) => {
        // see if alert exists, if no alert exists for this reading, ignore, don't handle
        // buffer
        const alertExists = fetchCustomerDeviceAlertByCustomerId(global.redis, customerDeviceId)
        if(!alertExists) resolve({ readingsMapped, finalBatchResults })

        Object.keys(readingsMapped[customerDeviceId]).map(async () => {
          if(!readingsMapped[customerDeviceId]) return
          
          const sensorReadings:any = readingsMapped[customerDeviceId] || []
          let buffer = await global.redisk.getOne(SensorBuffer, `${customerDeviceId}`);
          // instantiate an empty buffer for sensor name
          if (!buffer) {
            await global.redisk.save(new SensorBuffer(customerDeviceId, '', JSON.stringify({})));
            buffer = await global.redisk.getOne(SensorBuffer, `${customerDeviceId}`);
          }
          for(let sensorName in sensorReadings) {
            sensorReadings[sensorName].map(async (reading: any) => {
              reading.name = sensorName
              let newSensorBuffer = insertLatestSensorReading(buffer, reading)
              await global.redisk.save(newSensorBuffer)
              resolve({ newSensorBuffer, readingsMapped, finalBatchResults })
            })
          }
      })
    })
  })
}
