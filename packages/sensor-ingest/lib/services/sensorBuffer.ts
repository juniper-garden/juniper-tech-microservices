import JuniperCore from '@juniper-tech/core'
import { ReadingsByCustomerId, SensorReading } from './kafkaSensorRecordProcessor'
const { JuniperRedisUtils } = JuniperCore
const { JuniperRedisBuffer, SensorBuffer,  insertLatestSensorReading} = JuniperRedisUtils

type SensorBufferParam = {
  redisk: any;
  readingsMapped: ReadingsByCustomerId
}

export default async function sensorBuffer({ redisk, readingsMapped }: SensorBufferParam): Promise<any> {
  if(!readingsMapped) return null
  return new Promise(async (resolve, reject) => {
      Object.keys(readingsMapped).map(async (customerDeviceId: string) => {
        Object.keys(readingsMapped[customerDeviceId]).map(async () => {
          if(!readingsMapped[customerDeviceId]) return
          
          const sensorReadings:any = readingsMapped[customerDeviceId] || []
          let buffer = await redisk.getOne(SensorBuffer, `${customerDeviceId}`);
          // instantiate an empty buffer for sensor name
          if (!buffer) {
            await redisk.save(new SensorBuffer(customerDeviceId, '', JSON.stringify({})));
            buffer = await redisk.getOne(SensorBuffer, `${customerDeviceId}`);
          }
  
          sensorReadings.map(async (reading: SensorReading) => {
            let newSensorBuffer = insertLatestSensorReading(buffer, reading)
            await redisk.save(newSensorBuffer)
            resolve(newSensorBuffer)
          })
      })
    })
  })
}
