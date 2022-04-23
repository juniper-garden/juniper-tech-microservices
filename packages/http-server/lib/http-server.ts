require('dotenv').config('../.env')
import express, { Response, Request } from 'express'
import bodyParser from 'body-parser'
import JuniperCore from '@juniper-tech/core'
import cors from 'cors'

const app = express();
const { JuniperKafka } = JuniperCore
const PORT = process.env.PORT || 3000
const kafka = JuniperKafka(process.env.KAFKA_BROKERS || '', 'juniper-http-client', 2)

async function setupKafka() {
    const producer = kafka.producer()
    await producer.connect()

    app.set('kafka_producer', producer)
}

setupKafka()

app.use(bodyParser.json({
    limit: 10000
}))

app.use(cors())

app.post('/sensor-ingest', async (req: Request, res: Response) => {
    const { body } = req
    const producer: any = req.app.get('kafka_producer')
    try {
        await producer.send({
            topic: 'sensor-ingest',
            messages: [
                { key: 'data', value: JSON.stringify(body), partition: 0 }
            ]
        })

        res.status(200).json({
            requestId: body.requestId,
            timestamp: body.timestamp
        })
    } catch (error) {
        res.status(500).json({})
    }
    return null
})

app.listen(PORT, function () {
    console.log(`App listening on port ${PORT}!`);
})