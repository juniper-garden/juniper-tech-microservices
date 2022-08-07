import allQueues from '../jobs'

import { JobInterface, TypicalAlertEngineResult } from "../../lib/customTypes";
import type { queue, done } from "fastq";

export default function allNotificationsHandler(job: JobInterface, done: done) {
  const queryTypeHash: { [key:string]: queue } = {
    mobilePushNotification: allQueues?.outboundMobilePushNotificationQ,
    desktopPushNotification: allQueues?.outboundDesktopPushNotificationQ,
    email: allQueues?.outboundEmailQ,
    // sms: queues.outboundSMSQ
  }

  const { data }: any = job

  if(data.length == 0) return done(null)
  data.forEach((alert: TypicalAlertEngineResult) => {
    const events = alert.events.map(item => item.params)
    if(!events.length) return
    events.forEach((event: any) => {
      event.forEach(async (payload: any) => {
        const queueForEvent = queryTypeHash[payload.type]
        if(!queueForEvent) return done(new Error(`queue does not exist for event type ${payload.type}`))
        try {
          queueForEvent.push(data)
        } catch(err) {
          console.info(err)
        }
        done(null)
      })
    })
  })

  done(null)
}