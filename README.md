<div align="center">

# SBC Cafe Mobile Order Project

<a href="https://nodejs.org"><img src="https://img.shields.io/badge/NodeJS-v20.17.0-blue?logo=nodedotjs&logoColor=%23fff" alt="NodeJS v20.17.0" /></a> <a href="https://blog.angular.dev/angular-v18-is-now-available-e79d5ac0affe"><img src="https://img.shields.io/badge/Built%20With%20Angular%20v18-blue?logo=angular&logoColor=white" alt="Angular 18" /></a>

<br />
<br />
</div>

South Bay Church - Web app for mobile ordering from the cafe

## Project

https://github.com/users/mgraphic/projects/2

## Repository

https://github.com/mgraphic/SBC-Cafe-Mobile-Order

## Demo

To run the demo directly from your computer, you will need Docker Desktop installed. This is a free software available to download at [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Once you downloaded this code base or cloned it directly from [Git](https://git-scm.com/downloads) you can run the commands below from a terminal or command console to create the demo platform. Be sure that Docker Desktop is open and running.

Run this command to build and run the demo:

```sh
docker compose -f docker-compose.local.yml up --build -d
```

Open the browser to view both the [store](http://localhost:80) and [admin](http://localhost:81) sites:

```sh
open http://localhost:80
open http://localhost:81
```

Login as demo admin user:
**Username/Email:** admin@local
**User Password:** demo

When you want to shut everything down, use the following command to stop and remove all the demo containers and images:

```sh
docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q) && docker rmi -f $(docker images -aq)
```

## Dev

To build and package the shared module:

_./Apps/shared_

```sh
npm run build
```

To automatically distribute and install the build file to the apps run the following command:

```sh
node ./distribute.js
```

Copy the artifact from the `output` dir to the `Apps/*-service/custom_modules/`

Run this command to build and run the db:

```sh
docker compose -f docker-compose.dev.yml up --build -d
```

When you want to shut everything down, use the following command to stop and remove all the demo containers:

```sh
docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q) && docker rmi -f $(docker images -aq)
```

## Docker

To build and/or run a specific container, refer to the container service name...

```sh
# Build and run the cafe store container
docker compose up --build cafe-store -d

# Only build the cafe store container
docker compose build cafe-store

# Only run the cafe store container
docker compose up cafe-store -d
```

To build and/or run ALL containers, use the following command...

```sh
# Build and run all containers
docker compose up --build -d

# Only build all containers
docker compose build

# Only run all containers
docker compose up -d
```

Other docker commands...

```sh
# List containers
docker ps

# Stop and remove containers
docker compose down

# Remove all images
docker rmi -f $(docker images -aq)

# Stop all the containers
docker stop $(docker ps -a -q)

# Remove all the containers
docker rm $(docker ps -a -q)
```

To build and run local DB container, use the following command...

```sh
# To build and run local DB and iniitialize the schema and data for the first time
docker compose -f docker-compose.local.yml up db-init -d

# Run the local DB without initializing the data
docker compose -f docker-compose.local.yml up dynamodb-local -d

# List defined tables (requires AWS-CLI installation)
AWS_ACCESS_KEY_ID=dummyaccesskey AWS_SECRET_ACCESS_KEY=dummysecretkey aws dynamodb list-tables --endpoint-url http://localhost:8000 --region dummy-region
```

## References

-   [AWS-CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) Installation
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) Installation
-   [Git](https://git-scm.com/downloads) Installation
