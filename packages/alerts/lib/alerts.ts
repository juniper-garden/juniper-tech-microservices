require('dotenv').config('../.env')
import { EachBatchPayload } from 'kafkajs'
import JuniperCore from '@juniper-tech/core'
import rulesIngest from './rules/rulesIngest'

const { JuniperKafka, JuniperConsumer } = JuniperCore

const kafka = JuniperKafka(process.env.KAFKA_BROKERS || '', 'juniper-ingest-client', 2)

async function alerts() {
  const consumer = await JuniperConsumer(kafka, 'nodejs-dev', null)

  await consumer.subscribe({ topic: 'alerts-topic', fromBeginning: true })

  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }: EachBatchPayload) => {
      const parsedData = []
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) {
          break
        }

        parsedData.push(JSON.parse(message?.value?.toString() || ''))
        resolveOffset(message.offset)
      }

      await rulesIngest(parsedData)
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

