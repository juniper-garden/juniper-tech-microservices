
import email from '../alerts/email';
import smsNotification from '../alerts/sms';
import desktopPushNotifiation from '../alerts/desktopPushNotification';
import mobilePushNotification from '../alerts/mobilePushNotification';

interface AlertStrategy {
  id: string,
  test: (alert_type: string) => boolean,
  handler: (alert_type: string) => Promise<any> | any
}

const alert_typeStrategies: AlertStrategy[] = [
  {
    id: 'sms',
    test: (alert_type: string) => alert_type === 'sms',
    handler: smsNotification
  },
  {
    id: 'email',
    test: (alert_type: string) => alert_type === 'email',
    handler: email
  },
  {
    id: 'desktopPushNofication',
    test: (alert_type: string) => alert_type === 'desktopPushNofication',
    handler: desktopPushNotifiation
  },
  {
    id: 'mobilePushNotification',
    test: (alert_type: string) => alert_type === 'mobilePushNotification',
    handler: mobilePushNotification
  }
]

function getAlertStrategy(uri: string, strategies: AlertStrategy[]) {
  return strategies.reduce((acc: AlertStrategy | null, strategy: AlertStrategy) => {
    if (acc == null) {
      return strategy.test(uri) ? strategy : acc
    }
    return acc
  }, null)
}

export async function handleAlert(alert_type: string, alertData: any): Promise<any> {
  const strategy: AlertStrategy | null = await getAlertStrategy(alert_type, alert_typeStrategies)

  if (!strategy) return ''

  const out = strategy.handler(alertData)
  return out || alert_type
}
