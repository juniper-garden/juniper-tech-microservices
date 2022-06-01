import { JobInterface } from "../../lib/customTypes";
import JuniperCore from '@juniper-tech/core';
import { findLatestEventsForSensor, saveLatestEvent } from '../utils/sensorBufferUtils';
import _ from "lodash";
import { shouldSend, saveAndExit } from '../utils/eventUtils';
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
    done(new Error('Error sending push notification'))
  }

  if(events && shouldSend(findLatestEventsForSensor(buffer))) {
    console.log('should send was true', findLatestEventsForSensor(buffer))
    const sent:any = await sendNotification(data)
    if(sent) return saveAndExit(buffer, done)
    done(new Error('Error sending push notification'))
  }
}

function sendNotification(data: any) {
  return Promise.resolve(true)
}