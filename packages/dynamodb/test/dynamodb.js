const AWS = require('aws-sdk')

const local = {
  endpoint: 'http://localhost:8000',
  region: ' ',
  accessKeyId: ' ',
  secretAccessKey: ' '
}

module.exports = {
  db: new AWS.DynamoDB(local),
  doc: new AWS.DynamoDB.DocumentClient(local),
  streams: new AWS.DynamoDBStreams(local)
}
