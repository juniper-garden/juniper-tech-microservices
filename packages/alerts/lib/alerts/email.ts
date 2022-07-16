import _ from "lodash";
import { shouldSend, saveAndExit } from '../utils/eventUtils';
import sgMail from '@sendgrid/mail';
import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes';
import nodeCache from '../cache/nodeCache';

export default async function email(job: RawAlertRuleInputWithParsedSensorHash[], done:  (params?:any) => void) {
    const [data] = job
    // fetch sensor from node cache
    try {
    console.log('made  here', data)
    const alertCache:RawAlertRuleInputWithParsedSensorHash | undefined = nodeCache.get(data.customer_device_id);
    // instantiate an empty buffer for sensor name
  
    if(!alertCache || alertCache.latest_events.length == 0) {
      const sent:any = await sendNotification(data)
      const latest_event = { event: 'email' }
      if(sent) return saveAndExit(data, latest_event, done)
      return done(new Error('Error sending push notification'))
    }

    let sendIt = shouldSend(alertCache?.latest_events)

    if(!sendIt) return done()

    const sent:any = await sendNotification(data)
    const latest_event = { event: 'email' }
    console.log('sent?', sent)
    if(sent) return saveAndExit(data, latest_event, done)
    return done(new Error('Error sending push notification'))
  } catch(err) {
    return done(new Error('Error sending push notification'))
  }
}

function sendNotification(data: RawAlertRuleInputWithParsedSensorHash) {
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
