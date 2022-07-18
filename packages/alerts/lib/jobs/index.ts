import desktopPushNotifiation from "../alerts/desktopPushNotification";
import email from "../alerts/email";
import allNotificationsHandler from "../alerts/allNotifications";
import type { queue } from "fastq";

// Define a queue
const outboundSMSQ: any = null

const outboundEmailQ: queue = require('fastq')(email, 1)

const outboundMobilePushNotificationQ: queue = require('fastq')(desktopPushNotifiation, 1)

const outboundDesktopPushNotificationQ: any = null

const allNotificationsQ: queue = require('fastq')(allNotificationsHandler, 1)


const allQueues: { [key: string]: queue} = {
  outboundSMSQ,
  outboundEmailQ,
  outboundMobilePushNotificationQ,
  outboundDesktopPushNotificationQ,
  allNotificationsQ
}


export default allQueues
