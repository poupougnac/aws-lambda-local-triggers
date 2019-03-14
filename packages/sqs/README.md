# aws-lambda-local-sqs-trigger

[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![build status](https://api.travis-ci.org/JamesKyburz/aws-lambda-local-triggers.svg)](https://travis-ci.org/JamesKyburz/aws-lambda-local-triggers)
[![downloads](https://img.shields.io/npm/dm/aws-lambda-local-sqs-trigger.svg)](https://npmjs.org/package/aws-lambda-local-sqs-trigger)
[![Greenkeeper badge](https://badges.greenkeeper.io/JamesKyburz/aws-lambda-local-triggers.svg)](https://greenkeeper.io/)

run an aws lambda trigger for sqs locally.

### usage

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

# license
[Apache License, Version 2.0](LICENSE)
