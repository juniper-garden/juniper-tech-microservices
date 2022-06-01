require('dotenv').config('../.env')
import { EachBatchPayload } from 'kafkajs'
import JuniperCore from '@juniper-tech/core'
import ingestPipe from './services/ingestPipe';
const { JuniperRedisUtils } = JuniperCore
const { JuniperRedisBuffer } = JuniperRedisUtils

const { JuniperKafka, JuniperConsumer } = JuniperCore

const kafka = JuniperKafka(process.env.KAFKA_BROKERS || '', 'juniper-ingest-client', 2)

async function setupRedis() {
  const redisObjects:any = await JuniperRedisBuffer('redis://localhost:6379')
  global.redisk = redisObjects.redisk
  global.redis = redisObjects.redis
}

setupRedis()



process.once('SIGTERM', async function (code) {
  console.log('SIGTERM received...');
  await global.redisk.close()
  await global.redis.quit()
});


async function sensorIngest() {
  const consumer = await JuniperConsumer(kafka, 'nodejs-dev', null)

  await consumer.subscribe({ topic: 'sensor-ingest', fromBeginning: true })
  global.producer = kafka.producer()
  await global.producer.connect()

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

      await ingestPipe(parsedData)
      await heartbeat()
    }
  }).catch((err: any) => {
    console.error(err)
  })
}

try {
  sensorIngest()
} catch (err) {
  console.error(err)
}
