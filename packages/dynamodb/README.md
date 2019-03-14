# aws-lambda-local-dynamodb-trigger

[![js-standard-style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![build status](https://api.travis-ci.org/JamesKyburz/aws-lambda-local-triggers.svg)](https://travis-ci.org/JamesKyburz/aws-lambda-local-triggers)
[![downloads](https://img.shields.io/npm/dm/aws-lambda-local-dynamodb-trigger.svg)](https://npmjs.org/package/aws-lambda-local-dynamodb-trigger)
[![Greenkeeper badge](https://badges.greenkeeper.io/JamesKyburz/aws-lambda-local-triggers.svg)](https://greenkeeper.io/)

run an aws lambda trigger for dynamodb locally.

### usage

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
