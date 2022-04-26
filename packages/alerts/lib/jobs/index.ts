import allNotificationsHandler from "../../lib/alerts/allNotifications";

// tslint:disable-next-line: variable-name
const Queue = require('bull')

interface Queues {
  outboundSMSQ: any;
  outboundEmailQ: any;
  outboundMobilePushNotificationQ: any;
  outboundDesktopPushNotificationQ: any;
  allNotificationsQ: any;
}

const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379'
console.log('redisuUrl', redisUrl)
// Define a queue
const outboundSMSQ: any = new Queue('outbound_sms_q', redisUrl, {
  redis: {
    tls: {}
  }
})

const outboundEmailQ: any = new Queue('outbound_email_q', redisUrl, {
  redis: {
    tls: {}
  }
})

const outboundMobilePushNotificationQ: any = new Queue('outbound_mobile_push_notification_q', redisUrl, {
  redis: {
    tls: {}
  }
})

const outboundDesktopPushNotificationQ: any = new Queue('outbound_desktop_push_notification_q', redisUrl, {
  redis: {
    tls: {}
  }
})

const allNotificationsQ: any = new Queue('all_notification_q', redisUrl, {
  redis: {
    tls: {}
  }
})

outboundSMSQ.process()
outboundEmailQ.process()
outboundMobilePushNotificationQ.process()
outboundDesktopPushNotificationQ.process()
allNotificationsQ.process(allNotificationsHandler)

// queues.outboundSensorReadingQueue.add(finalBatchResults, {
//   attempts: 2,
//   removeOnComplete: true
// })

const exportables: Queues = {
  outboundSMSQ,
  outboundEmailQ,
  outboundMobilePushNotificationQ,
  outboundDesktopPushNotificationQ,
  allNotificationsQ
}

export default exportables
