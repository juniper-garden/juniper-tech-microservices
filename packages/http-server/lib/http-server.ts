require('dotenv').config('../.env')
import DB from './db/sequelize_connection'
import SensorReading from './db/models/sensor-reading'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { sensorIngestPoint } from './controllers/sensorIngestController';
import kafka from './kafka/kafka';

const app = express()
const port = process.env.PORT || 3000


async function setupKafkaProducer() {
    const producer = kafka.producer()
    await producer.connect()

    app.set('kafka_producer', producer)
    return producer
}

const producer = setupKafkaProducer()

app.set('kafka_producer', producer)
app.use(bodyParser.json({
    limit: 10000
}))

app.use(cors())

export async function attemptDBConnect() {
    try {
        await DB.authenticate()
        console.log('Connection has been established successfully.')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
        process.exit(1)
    }
}

app.get('/', (req, res) => {
    SensorReading.findAll().then((sensorReadings: any) => {
        res.send(sensorReadings)
    })
})

app.post('/sensor-ingest', sensorIngestPoint)

app.post('/test-put', async (req, res) => {
    const { body } = req
    res.status(200).json(body)
})

app.listen(port, () => {
    attemptDBConnect()
    console.log(
        '⚡️[server]: Server is running at https://localhost:%d in %s mode',
        port,
        app.get('env')
    )
    console.log('  Press CTRL-C to stop\n')
})