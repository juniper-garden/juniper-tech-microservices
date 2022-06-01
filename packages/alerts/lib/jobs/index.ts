import desktopPushNotifiation from "../alerts/desktopPushNotification";
import email from "../alerts/email";
import allNotificationsHandler from "../alerts/allNotifications";

// tslint:disable-next-line: variable-name
const Queue = require('bull')
console.log('this should be firing')
interface Queues {
  outboundSMSQ: any;
  outboundEmailQ: any;
  outboundMobilePushNotificationQ: any;
  outboundDesktopPushNotificationQ: any;
  allNotificationsQ: any;
}

const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379'
console.log('redisuUrl', redisUrl)

const redisOptions = redisUrl.includes('rediss') ? {
  redis: {
    tls: {}
  }
} : {}
// Define a queue
const outboundSMSQ: any = new Queue('outbound_sms_q', redisUrl, redisOptions)

const outboundEmailQ: any = new Queue('outbound_email_q', redisUrl, redisOptions)

const outboundMobilePushNotificationQ: any = new Queue('outbound_mobile_push_notification_q', redisUrl, redisOptions)

const outboundDesktopPushNotificationQ: any = new Queue('outbound_desktop_push_notification_q', redisUrl, redisOptions)

const allNotificationsQ: any = new Queue('all_notification_q', redisUrl, redisOptions)

// outboundSMSQ.process()
outboundEmailQ.process(email)
// outboundMobilePushNotificationQ.process()
outboundDesktopPushNotificationQ.process(desktopPushNotifiation)
allNotificationsQ.process(allNotificationsHandler)

// queues.outboundSensorReadingQueue.add(finalBatchResults, {
//   attempts: 2,
//   removeOnComplete: true
// })

const allQueues: Queues = {
  outboundSMSQ,
  outboundEmailQ,
  outboundMobilePushNotificationQ,
  outboundDesktopPushNotificationQ,
  allNotificationsQ
}


export default allQueues
