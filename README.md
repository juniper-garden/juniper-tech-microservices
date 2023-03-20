### Juniper Tech OS Handlers

These are the handlers that tie into various events inside of the Juniper Tech Ingstion Stack.
These are meant to be small functions that handle specific tasks. Each package requires...

- Dockerfile
- Devspace yml config
- .env file

Each handler needs to accept these env variables:

- topic (the event topic to subscribe to)
- kafka url

## Getting Started

We use docker to start development infrastructure, it is required to have running before
you can begin developing the server side portion of the application. This is a nodejs
ingestion server that interfaces with a separate database, this server doesn't handle
sensor onboarding, only ingestion of data at the moment. In the future, device onboarding
and management will be moved either to this repository or a separate repository.

## Development

- Install dependencies with `yarn install`
- devspace (`yarn global add devspace`)
- run `docker volume create timeseries-db-volume`
- run `docker-compose up -d` to make sure services have started

### Only needed for package publishing

- run `lerna link && lerna bootstrap` to symlink cross dependencies

## Kubernetes Local Deployment

### Technologies

- TimescaleDb (pg13)
- Kafka
- Zookeeper
- Kafka-ui
- (Docker) <https://docs.docker.com/get-docker/>
- kubectl `brew install kubectl`
- minikube `brew install minikube`
