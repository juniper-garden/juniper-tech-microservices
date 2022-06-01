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
  let unwrappedData = await data
  const { readingsMapped, finalBatchResults } = unwrappedData

  if(!finalBatchResults?.length) return null
  // keys alerts_config:alerts_config81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad:CustomerDevice
  return new Promise(async (resolve, reject) => {
      Object.keys(readingsMapped).map(async (customerDeviceId: string) => {
        // see if alert exists, if no alert exists for this reading, ignore, don't handle
        // buffer
        const rawRedisAlertsForDevice = await fetchCustomerDeviceAlertByCustomerId(global.redis, customerDeviceId)
        const alertConfigString = rawRedisAlertsForDevice.filter((x: any) => !!x)
        
        if(!alertConfigString || alertConfigString.length === 0) return resolve({ readingsMapped, finalBatchResults })
        console.log('alertConfigString', alertConfigString)
        let alertExists = alertConfigString.map((alertPayload: any) => JSON.parse(alertPayload))

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
              await global.producer.send({
                topic: 'alerts-topic',
                messages: [
                    { key: 'data', value: JSON.stringify({ device_buffer: newSensorBuffer, alert_config: alertExists.map((x: any) => x.json_rule) }), partition: 0 }
                ]
              })
              resolve({ newSensorBuffer, readingsMapped, finalBatchResults })
            })
          }
      })
    })
  })
}
