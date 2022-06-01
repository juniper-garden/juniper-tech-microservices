# `sensor-ingest`

# Deployment
Devspace builds the image and tags it based on the image vars
```
vars:
- name: IMAGE
  value: registry.digitalocean.com/juniper-mqtt/sensor-ingest
```

You can use the deploy command to simplify this process.
* devspace deploy -p production
## Usage

```
const sensorIngest = require('sensor-ingest');

// TODO: DEMONSTRATE API
```
