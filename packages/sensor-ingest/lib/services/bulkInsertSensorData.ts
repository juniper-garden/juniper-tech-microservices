import { SensorReading } from '../types/interfaces';
import DB from '../db/sequelize_connection';
import JuniperCore from '@juniper-tech/core'
import { ReadingsByCustomerId } from './kafkaSensorRecordProcessor';
const { SensorModel } = JuniperCore

export function bulkInsertSensorData({ readingsMapped, finalBatchResults }: { readingsMapped: ReadingsByCustomerId; finalBatchResults: SensorReading[]; }): Promise<void | { readingsMapped: ReadingsByCustomerId; finalBatchResults: SensorReading[]; }> | { readingsMapped: ReadingsByCustomerId; finalBatchResults: SensorReading[]; } {
  if(!!process.env.USE_DB) {
    let sensorPg = SensorModel(DB)
    return sensorPg.bulkCreate(finalBatchResults as any)
    .then(() => {
      return { readingsMapped, finalBatchResults }
    })
    .catch((err:any) => {
      console.error('error', err)
    })
  }

  return { readingsMapped, finalBatchResults }
}