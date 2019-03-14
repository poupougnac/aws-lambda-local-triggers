# aws-lambda-local-triggers

[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![build status](https://api.travis-ci.org/JamesKyburz/aws-lambda-local-triggers.svg)](https://travis-ci.org/JamesKyburz/aws-lambda-local-triggers)
[![Greenkeeper badge](https://badges.greenkeeper.io/JamesKyburz/aws-lambda-local-triggers.svg)](https://greenkeeper.io/)

Run aws lambda triggers locally.

Support for

* [sqs](packages/sqs)
* [dynamodb](packages/dynamodb)

### sqs usage

```javascript
const loop = require('aws-lambda-local-sqs-trigger')
const sqs = require('./sqs')

loop({
  queueUrl: 'http://localhost:9324/queue/test',
  sqs,
  async trigger (messages) {
  }
})
```

### dynamodb usage

```javascript
const loop = require('aws-lambda-local-dynamodb-trigger')
const { streams } = require('./dynamodb')

loop({
  streamArn: 'x',
  streams,
  async trigger (records) {
  }
})
```

# license

[Apache License, Version 2.0](LICENSE)
