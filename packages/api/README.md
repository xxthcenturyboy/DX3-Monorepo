# API

This package encapsulates all apis, workers, etc *AND* shared code with the `/libs` directory.
This package.json and other config files exist simply to run unit tests.
All of the code in the `/libs` dir is testable due to these configurations, however to run the code, you'll need to run an actual API or worker.
The configuration files in this dir do not affect the apis and workers.
The .env file and package.json here should be kept up to date for testing `/libs`.

---

## Dev

__These /libs/ files do not run independently. Run an API to call these__

---

## Testing

### Run inside container

Runs all libs tests
```Bash
pnpm --filter @dx3/api test:libs
```

Run tests for a specific lib (e.g., auth)
```Bash
pnpm --filter @dx3/api test --testPathPattern="libs/auth"
```

Runs a specific test in the libs directory
```Bash
pnpm --filter @dx3/api test --testPathPattern="libs/auth/auth-api.service.spec"
```

## S3

```Bash
export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_DEFAULT_REGION="us-east-1"
```

List items in bucket
```Bash
aws s3 ls s3://dx-bucket-user-content --endpoint-url=http://localhost:4566 --recursive
```

make a sample bucket
```Bash
aws s3 mb s3://bucket1 --endpoint-url=http://localhost:4566
```
