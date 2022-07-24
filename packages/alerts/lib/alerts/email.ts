import _ from "lodash";
import moment from 'moment'
import { shouldSend, saveAndExit } from '../utils/eventUtils';
import sgMail from '@sendgrid/mail';
import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes';
import nodeCache from '../cache/nodeCache';

export default async function email(job: RawAlertRuleInputWithParsedSensorHash[], done:  (params?:any) => void) {
    const [data] = job
    // fetch sensor from node cache
    try {
    const alertCache:RawAlertRuleInputWithParsedSensorHash | undefined = nodeCache.get(data.customer_device_id);
    // instantiate an empty buffer for sensor name
  
    if(!alertCache || alertCache.latest_events?.length == 0) {
      const sent:any = await sendNotification(data)
      const latest_event = { event: 'email' }
      if(sent) return saveAndExit(data, latest_event, done)
      return done(new Error('Error sending push notification'))
    }

    let sendIt = shouldSend(alertCache?.latest_events)

    if(!sendIt) return done()

    const sent:any = await sendNotification(data)
    const latest_event = { event: 'email' }
    if(sent) return saveAndExit(data, latest_event, done)
    return done(new Error('Error sending push notification'))
  } catch(err) {
    return done(new Error('Error sending push notification'))
  }
}

function sendNotification(data: any) {
  console.log('sent an email')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')
  let date = moment().format('ll')
  console.log('data.events[0].params[0].data.email', data.events[0].params[0].data.email)
  const msg = {
    to: data.events[0].params[0].data.email,
    from: 'dashcraft@junipergarden.co',
    subject: `🚨 Alert Was Triggered on ${date}`,
    html: `<section>
      <h1>
        You had an alert that was triggered on ${date}.
      </h1>
      <h3>
        Here are some details:
      </h3>
      ${data.results.conditions.any.reduce((acc:string, curr:any) => {
        return acc + curr.all.reduce((newAcc: any, newCurr: any) => {
          return newAcc + 
          `<div style="margin-bottom: 5%;">
              <p>Alert Operator: ${newCurr.operator}</p>
              <p>Threshold Set: : ${newCurr.value}</p>
              <p>Data Point Name: ${newCurr.fact}</p>
              <p>Data Point Value: ${newCurr.factResult}</p>
              <p>Did trigger?: ${newCurr.result}</p>
          </div>
          </br>
          </br>
          </br>
          </br>
          `
        }, '') 
      }, '')}
    </section>`,
  };
  
  return sgMail.send(msg);
}
