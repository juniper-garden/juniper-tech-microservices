import { JobInterface } from "../../lib/customTypes";
import JuniperCore from '@juniper-tech/core';
import { findLatestEventsForSensor, saveLatestEvent } from '../utils/sensorBufferUtils';
import _ from "lodash";
import { shouldSend, saveAndExit } from '../utils/eventUtils';
import sgMail from '@sendgrid/mail';

const { JuniperRedisUtils } = JuniperCore
const { SensorBuffer } = JuniperRedisUtils

export default async function email(job: JobInterface, done:  (params?:any) => void) {
  const { data: jobData }: any = job;
  const [ data ] = jobData

  let buffer = await global.redisk.getOne(SensorBuffer, `${data.device_buffer.customer_device_id}`);
  // instantiate an empty buffer for sensor name
  let events = await findLatestEventsForSensor(buffer);
 
  if(!events) {
    const sent:any = await sendNotification(data)
    if(sent) return saveAndExit(buffer, done)
    return done(new Error('Error sending push notification'))
  }
  let sendIt = shouldSend(findLatestEventsForSensor(buffer))

  if(!sendIt) return done()

  const sent:any = await sendNotification(data)
  if(sent) return saveAndExit(buffer, done)
  return done(new Error('Error sending push notification'))
}

function sendNotification(data: any) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  const msg = {
    to: 'daniel.ashcraft@ofashandfire.com',
    from: 'dashcraft@junipergarden.co',
    subject: 'Hello world',
    text: 'Hello plain world!',
    html: '<p>Hello HTML world!</p>',
  };
  
  return sgMail.send(msg);
}
