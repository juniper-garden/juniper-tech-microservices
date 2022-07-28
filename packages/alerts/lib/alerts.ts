require('dotenv').config('../.env')
import { EachBatchPayload } from 'kafkajs'
import JuniperCore from '@juniper-tech/core'
import express, { Request, Response } from 'express'
import rulesIngest from './rules/rulesIngest'

const { JuniperKafka, JuniperConsumer } = JuniperCore
const app = express();

const kafka = JuniperKafka(process.env.KAFKA_BROKERS || '', 'juniper-ingest-client', 2)

process.once('SIGTERM', async function (code) {
  console.log('SIGTERM received...', code);
});

async function alerts() {
  const consumer = await JuniperConsumer(kafka, `alerts-topic-consumer-primary`, null)

  await consumer.subscribe({ topic: 'alerts-topic', fromBeginning: true })
  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }: EachBatchPayload) => {
      const parsedData = []

      for (const message of batch.messages) {
        if (!isRunning() || isStale()) {
          break
        }
        let pdata = null
        try {
          pdata = JSON.parse(message?.value?.toString() || '')
        } catch(err) {
          console.info(err)
        }
        
        if(pdata) parsedData.push(pdata)

        resolveOffset(message.offset)
      }
      try {
        // the finish event is emitted when all data has been flushed from the stream
        await rulesIngest(parsedData)
      } catch(err) {
        console.info('error in rules ingest', err)
      }
      await heartbeat()
    }
  }).catch((err: any) => {
    console.error(err)
  })
}

try {
    alerts()
} catch (err) {
    console.error(err)
}

app.get('/', (req: Request, res: Response) => {
  res.status(200)
})

const PORT = process.env.PORT || 3000

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
})