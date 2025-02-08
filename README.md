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
