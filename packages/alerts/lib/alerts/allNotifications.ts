import queues from '../jobs'

import { JobInterface, TypicalAlertEngineResult } from "../../lib/customTypes";

interface QueryTypeHash {
  [key: string]: any;
  mobilePushNotification: any,
  desktopPushNotification: any,
  email?: any;
  sms?: any;
}

const queryTypeHash: QueryTypeHash = {
  mobilePushNotification: queues.outboundMobilePushNotificationQ,
  desktopPushNotification: queues.outboundDesktopPushNotificationQ,
  // email: queues.outboundEmailQ,
  // sms: queues.outboundSMSQ
}

export default function allNotificationsHandler(job: JobInterface, done: () => void) {
  const { data }: any = job

  data.forEach((alert: TypicalAlertEngineResult) => {
    const events = alert.events.map(item => item.params)
    if(!events.length) return
    events.forEach((event: any) => {
      const queue = queryTypeHash[event.type]
      if(!queue) return
      queue.add(alert, {
        attempts: 2,
        removeOnComplete: true
      })
    })
  })

  done()
}