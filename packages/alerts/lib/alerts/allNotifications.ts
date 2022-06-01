import allQueues from '../jobs'

import { JobInterface, TypicalAlertEngineResult } from "../../lib/customTypes";

interface QueryTypeHash {
  [key: string]: any;
  mobilePushNotification?: any,
  desktopPushNotification?: any,
  email?: any;
  sms?: any;
}

export default function allNotificationsHandler(job: JobInterface, done: (args?: any) => void) {
  const queryTypeHash: QueryTypeHash = {
    mobilePushNotification: allQueues?.outboundMobilePushNotificationQ,
    desktopPushNotification: allQueues?.outboundDesktopPushNotificationQ,
    email: allQueues?.outboundEmailQ,
    // sms: queues.outboundSMSQ
  }
  const { data }: any = job
  
  data.forEach((alert: TypicalAlertEngineResult) => {
    const events = alert.events.map(item => item.params)
    if(!events.length) return
    events.forEach((event: any) => {
      event.forEach((payload: any) => {
        const queue = queryTypeHash[payload.type]
        if(!queue) return done(new Error('queue doesnt exist'))
        queue.add(data, {
          attempts: 2,
          removeOnComplete: true
        })
      })
      
    })
  })

  done()
}