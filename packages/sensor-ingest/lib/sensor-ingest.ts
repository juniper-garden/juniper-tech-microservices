require('dotenv').config('../.env')
import { EachBatchPayload } from 'kafkajs'
import JuniperCore from '@juniper-tech/core'
import ingestPipe from './services/ingestPipe';

const { JuniperKafka, JuniperConsumer } = JuniperCore

const kafka = JuniperKafka(process.env.KAFKA_BROKERS || '', 'juniper-ingest-client', 2)

async function sensorIngest() {
  const consumer = await JuniperConsumer(kafka, 'nodejs-dev', null)

  await consumer.subscribe({ topic: 'sensor-ingest', fromBeginning: true })
  console.log('made it past consumer')

  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }: EachBatchPayload) => {
      console.log('inside of batch payload')
      const parsedData = []
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) {
          break
        }

        console.log('consumer is running and here is the data', JSON.parse(message?.value?.toString() || ''))

        parsedData.push(JSON.parse(message?.value?.toString() || ''))
        resolveOffset(message.offset)
      }
      console.log('made it to before adding to queue', parsedData)  
      console.log('made it passed adding to queue', parsedData)
      await ingestPipe(parsedData)
      await heartbeat()
    }
  }).catch((err: any) => {
    console.error(err)
  })
}

sensorIngest()