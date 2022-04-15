require('dotenv').config('../../.env')
import { SensorReading } from '../types/interfaces';
import DB from '../db/sequelize_connection';
import JuniperCore from '@juniper-tech/core'
const { SensorModel } = JuniperCore

export async function bulkInsertSensorData(data: SensorReading[]): Promise<any> {
  let sensorPg = SensorModel(DB)
  if (process.env.USE_DB) {
    console.log('saving to db')
    return sensorPg.bulkCreate(data as any).catch((err:any) => {
      console.error('error', err)
    })
  }
  return Promise.resolve(data)
}
