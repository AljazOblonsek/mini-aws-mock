<p align="center">
    LOGO
</p>

# Mini AWS Mock

![Dashboard Preview](./assets/dashboard-preview.png)

Mini AWS Mock is a simple AWS emulator, designed to run and emulate AWS services locally. It features a Docker image and a user-friendly UI for managing the mock. Currently, it supports a subset of SNS services. You can view the [feature coverage here](#feature-coverage).

## Table of Contents

- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#getting-started-prerequisites)
  - [Starting the Mock](#starting-the-mock)
  - [Using AWS CLI with the Mock](#using-aws-cli-with-the-mock)
  - [Accessing the Web Dashboard](#accessing-the-web-dashboard)
- [Docker & Docker Compose](#docker--docker-compose)
  - [Examples](#examples)
  - [Configuration Options](#configuration-options)
  - [Persistence and Initial Data](#persistence-and-initial-data)
  - [Initial Data Files and Schemas](#initial-data-files-and-schemas)
- [Feature Coverage](#feature-coverage)
  - [SNS](#sns)
- [Local Development](#local-development)
  - [Prerequisites](#local-development-prerequisites)
  - [Setup & Run](#setup--run)
  - [Testing](#testing)
- [Contributing](#contributing)
- [Project Motivation](#project-motivation)
- [Licensing](#licensing)

## Key Features

- :key: Emulates AWS v4 signature process
- :desktop_computer: Includes a user-friendly dashboard for managing the mock with real-time updates
- :whale: Provides Docker images for easy setup and usage

## Getting Started

<h3 id="getting-started-prerequisites">Prerequisites</h3>

- [Docker](https://www.docker.com/)

### Starting the Mock

To start the mock, run the following command:

```bash
docker run \
    -e AWS_REGION=us-east-1 \
    -e AWS_USER_ID='00000000' \
    -e AWS_ACCESS_KEY=mock-access-key \
    -e AWS_SECRET_KEY=mock-secret-key \
    -p 8000:8000 \
    aljazo/mini-aws-mock:latest
```

### Using AWS CLI with the Mock

Ensure you run `aws configure` and set your region, access key, and secret key to match the Docker environment variables.

```bash
# Create an SNS topic
aws --endpoint http://localhost:8000 sns create-topic --name my-first-topic

# Publish a message to an SNS topic
aws --endpoint http://localhost:8000 sns publish --topic-arn "arn:aws:sns:us-east-1:00000000:my-first-topic" --message "My first message for my first topic!"
```

### Accessing the Web Dashboard

- Access the dashboard at [http://localhost:8000/ui](http://localhost:8000/ui).

_Hint: The dashboard updates in real-time when you publish to SNS.._

## Docker & Docker Compose

The `aljazo/mini-aws-mock` Docker container is the recommended method for using the mock. Find it on [Docker Hub](add-url).

### Examples

- Docker:

```bash
docker run \
    -e AWS_REGION=us-east-1 \
    -e AWS_USER_ID='00000000' \
    -e AWS_ACCESS_KEY=mock-access-key \
    -e AWS_SECRET_KEY=mock-secret-key \
    -p 8000:8000 \
    aljazo/mini-aws-mock:latest
```

- Docker Compose:

```yml
services:
  mini-aws-mock:
    image: aljazo/mini-aws-mock:latest
    environment:
      AWS_REGION: us-east-1
      AWS_USER_ID: '00000000'
      AWS_ACCESS_KEY: mock-access-key
      AWS_SECRET_KEY: mock-secret-key
    ports:
      - '8000:8000'
```

### Configuration Options

Configure the container using the following environment variables:

- `LOG_LEVEL`: Sets the mock's log level (either `debug` or `info`, defaults to `info`)
- `LIST_RESPONSE_SIZE`: Sets the list response size for AWS actions that return a list of records (defaults to `undefined`, returning all records)
- `AWS_REGION`: Mock region
- `AWS_USER_ID`: Mock user ID used for requests
- `AWS_ACCESS_KEY`: Mock access key for v4 signature emulation
- `AWS_SECRET_KEY`: Mock secret key for v4 signature emulation

### Persistence and Initial Data

Persist data between restarts by binding a local folder to `/app/data` in Docker:

```yml
services:
  mini-aws-mock:
    image: aljazo/mini-aws-mock:latest
    environment:
      AWS_REGION: us-east-1
      AWS_USER_ID: '00000000'
      AWS_ACCESS_KEY: mock-access-key
      AWS_SECRET_KEY: mock-secret-key
    volumes:
      - ./my-local-data:/app/data:rw
    ports:
      - '8000:8000'
```

Bind a local folder with JSON files for initial database setup. Learn more about file names and schemas [here](#initial-data-files-and-schemas).

```yml
services:
  mini-aws-mock:
    image: aljazo/mini-aws-mock:latest
    environment:
      AWS_REGION: us-east-1
      AWS_USER_ID: '00000000'
      AWS_ACCESS_KEY: mock-access-key
      AWS_SECRET_KEY: mock-secret-key
    volumes:
      - ./my-local-init-data:/app/initial-data:ro
    ports:
      - '8000:8000'
```

_Note: Both persistence and initial data volumes can be mounted. Initial data is processed only when the databases are first created._

### Initial Data Files and Schemas

Example `sns-topic.json`:

```json
[
  {
    "name": "my-topic",
    "arn": "arn:aws:sns:us-east-1:00000000:my-topic"
  },
  {
    "name": "another-topic",
    "arn": "arn:aws:sns:us-east-1:00000000:another-topic"
  }
]
```

## Feature Coverage

### SNS

| Operation                                                                      | Mock Support       | Dashboard Support  | Comment                                                            |
| ------------------------------------------------------------------------------ | ------------------ | ------------------ | ------------------------------------------------------------------ |
| [CreateTopic](https://docs.aws.amazon.com/sns/latest/api/API_CreateTopic.html) | :white_check_mark: | :white_check_mark: | UI for adding a new topic.                                         |
| [DeleteTopic](https://docs.aws.amazon.com/sns/latest/api/API_DeleteTopic.html) | :white_check_mark: | :white_check_mark: | UI for deleting a topic.                                           |
| [ListTopics](https://docs.aws.amazon.com/sns/latest/api/API_ListTopics.html)   | :white_check_mark: | :white_check_mark: | UI that display list of all topics.                                |
| [Publish](https://docs.aws.amazon.com/sns/latest/api/API_Publish.html)         | :yellow_square:    | :yellow_square:    | UI for viewing publish history and purging it. Logs received data. |

## Local Development

<h3 id="local-development-prerequisites">Prerequisites</h3>

- [Node v18.17.1](https://nodejs.org/download/release/v18.17.1/)

### Setup & Run

1. Create an .env file (refer to [.env.example](./.env.example) for values).

2. Install dependencies:

```bash
npm install
```

3. Start the mock in development mode:

```bash
npm run start:dev
```

You are now ready to develop the mock.

### Testing

- Run both unit and e2e tests:

```bash
npm run test
```

- Generate test coverage:

```bash
npm run test:cov
```

## Contributing

Your contributions are welcome! Please refer to the [contributing guide](./CONTRIBUTING.md) for more information.

## Project Motivation

Mini AWS Mock began as a personal endeavor; I was in search of a straightforward AWS SNS mock that didn't just do the job, but came with a simple UI for easy management. More than that, I wanted a mock that emulates the AWS v4 signature process. This project is the result of my curiosity about the inner workings of AWS, and it's designed to provide a simple, easy-to-use mock for anyone tackling similar projects or eager to explore AWS's complexities.

## License

This project is licensed under the MIT License. See the [license file](./LICENSE.md) for details.
