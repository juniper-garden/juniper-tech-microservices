import { JobInterface } from "../../lib/customTypes";
import JuniperCore from '@juniper-tech/core';
import { findLatestEventsForSensor, saveLatestEvent } from '../utils/sensorBufferUtils';
import _ from "lodash";
const { JuniperRedisUtils } = JuniperCore
const { SensorBuffer } = JuniperRedisUtils

export default async function desktopPushNotifiation(job: JobInterface, done:  (params?:any) => void) {
  const { data }: any = job;
  let buffer = await global.redisk.getOne(SensorBuffer, `${data.customer_device_id}`);
  // instantiate an empty buffer for sensor name
  let events = await findLatestEventsForSensor(buffer);

  if(!events) {
    const sent:any = await sendNotification(data)
    if(sent) return saveAndExit(buffer, done)
    console.log('data', data)
    done(new Error('Error sending push notification'))
  }

  if(events && shouldSend(findLatestEventsForSensor(buffer))) {
    console.log('should send was true', findLatestEventsForSensor(buffer))
    const sent:any = await sendNotification(data)
    if(sent) return saveAndExit(buffer, done)
    done(new Error('Error sending push notification'))
  }
}

function shouldSend(events:any) {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() - 1);
  // sort events by timestamp
  const latest = events.sort((a:any, b:any) => {
    return a.timestamp - b.timestamp;
  })
  let prevDate = new Date(latest[0].timestamp).getTime();
  console.log('current, prev', currentTime.getTime(), prevDate)
  return currentTime.getTime() > prevDate;
}

async function saveAndExit(buffer: any, done: (params?: any) => void) {
  try {
    await saveLatestEvent(global.redisk, buffer, { event: 'desktop_push_notification', timestamp: new Date() })
    done({ event: 'desktop_push_notification', timestamp: new Date() })
  } catch (e) {
    done(new Error('Error sending push notification'))
  }
}

function sendNotification(data: any) {
  return Promise.resolve(true)
}