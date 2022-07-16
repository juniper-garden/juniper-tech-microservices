import JuniperCore from '@juniper-tech/core'
import JGConnection from '../db/jg_connection'
import { ReadingsByCustomerId, SensorReading } from './kafkaSensorRecordProcessor'

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
  console.log('readingsMapped', readingsMapped, finalBatchResults)
  if(!finalBatchResults?.length) return null
  // keys alerts_config:alerts_config81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad:CustomerDevice
  return new Promise(async (resolve, reject) => {
      Object.keys(readingsMapped).map(async (customerDeviceId: string) => {
        // see if alert exists, if no alert exists for this reading, ignore, don't handle
        // buffer
        const [rows, meta]: any = await JGConnection.query(`
          SELECT * FROM alerts WHERE alertable_type = 'CustomerDevice' and alertable_id = '${customerDeviceId}' and status = 0
        `)
        console.log('rows, meta', rows, meta)
        if(!rows || rows.length === 0) return resolve({ readingsMapped, finalBatchResults })
        await sendSensorValuesToAlertsQueue({readingsMapped, customer_device_id: customerDeviceId, alert_configs: rows })
        resolve({ readingsMapped, finalBatchResults })
    })
  })
}

function sendSensorValuesToAlertsQueue ({readingsMapped, device_id, alerts}: any) {
  Object.keys(readingsMapped[device_id]).map(async () => {
    if(!readingsMapped[device_id]) return
    
    const sensorReadings:any = readingsMapped[device_id] || []

    await global.producer.send({
      topic: 'alerts-topic',
      messages: [
          { key: 'data', value: JSON.stringify({ readings: sensorReadings, alert_config: alerts.map((x: any) => x.json_rule) }), partition: 0 }
      ]
    })
  })
}