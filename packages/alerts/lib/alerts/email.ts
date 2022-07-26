import _ from "lodash";
import moment from 'moment'
import { shouldSend, saveAndExit, saveAndExitNoEvent } from '../utils/eventUtils';
import sgMail from '@sendgrid/mail';
import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes';
import nodeCache from '../cache/nodeCache';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')


export default async function email(job: RawAlertRuleInputWithParsedSensorHash[], done:  (params?:any) => void) {
    const [data] = job
    // fetch sensor from node cache
    try {
    const alertCache:RawAlertRuleInputWithParsedSensorHash | undefined = nodeCache.get(data.customer_device_id);
    // instantiate an empty buffer for sensor name
  
    if(!alertCache || alertCache.latest_events?.length === 0) {
      const sent:any = await sendNotification(data)
      const latest_event = { event: 'email' }
      console.log('no alertcache?', alertCache, sent)
      if(sent && alertCache) return saveAndExit(alertCache, latest_event, done)
      return saveAndExitNoEvent(data, latest_event, done)
    }

    let sendIt = shouldSend(alertCache?.latest_events)
    console.log('should send?', sendIt)

    if(!sendIt) return done()

    const sent:any = await sendNotification(data)

    const latest_event = { event: 'email' }
    if(sent) return saveAndExit(data, latest_event, done)
    return saveAndExitNoEvent(data, latest_event, done)
  } catch(err) {
    return done(new Error('Error sending push notification'))
  }
}

async function sendNotification(data: any) {
  let date = moment().format('ll')
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
      ${formatEmailDetails(data)}
    </section>`,
  };
  try {
    let res = await sgMail.send(msg)
    return res;
  } catch(err) {
    console.log('err', err)
    return;
  }
}


function formatEmailDetails (data: any) {
  return data.results[0].conditions?.any.reduce((acc:string, curr:any) => {
    let isAll = curr.all?.length > 0
    if(isAll) {
      return acc + curr.all?.reduce((newAcc: any, newCurr: any) => {
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
    }

    return acc + curr.any?.reduce((newAcc: any, newCurr: any) => {
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
    
  }, '')
}