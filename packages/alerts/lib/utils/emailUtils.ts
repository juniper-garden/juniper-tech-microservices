
import dotenv from 'dotenv';
import moment from "moment";
import sgMail from '@sendgrid/mail';

dotenv.config()


sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const outoundEmailAddress = process.env.SENDGRID_EMAIL || 'info@example.com'

export async function sendNotification(data: any) {
  let date = moment().format('ll')
  const msg = {
    to: data.events[0].params[0].data.email,
    from: outoundEmailAddress,
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