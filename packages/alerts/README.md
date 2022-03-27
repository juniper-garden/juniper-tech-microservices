# `alerts`

> TODO: description

## Usage

```
const alerts = require('alerts');

// TODO: DEMONSTRATE API
```

## Strategy

1. (outside fo this process) After data runs through sensor-ingest, it is loaded into a raw data table
2. Check if data has a rule and that rule is active
3. If data has a rule (alert rule) check the latest data point and compare with past 30 datapoints
4. If data average in past 30 datapoints + new data point triggers rule
5. Rule checks if an alert has already been triggered in past 5 minutes, if so, add log but don't trigger alert
6. If rule satisfied and no recent alerts, add alert to appropriate queue.

## Other considerations
1. Need to routinely saturate rules in Redis data store
2. Need to "cleanup" if a job has checks that need to take place (mobile requires cleanup)
3. Need to run a regression against datapoints to make sure datapoint isn't an outlier
4. Adding logs for alerts is more important that triggering external alerts