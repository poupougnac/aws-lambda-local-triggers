const trigger = require('../')
const { db, doc, streams } = require('./dynamodb')
const { test } = require('tap')

let onEmpty = f => f
let read = f => true
let fn = null
let loop

test('create image table', async t => {
  const streamArn = (await new Promise((resolve, reject) => {
    db.createTable(
      {
        TableName: 'Image',
        KeySchema: [
          {
            AttributeName: 'Id',
            KeyType: 'HASH'
          }
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'Id',
            AttributeType: 'S'
          }
        ],
        StreamSpecification: {
          StreamEnabled: true,
          StreamViewType: 'NEW_IMAGE'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        }
      },
      (err, data) => (err ? reject(err) : resolve(data))
    )
  })).TableDescription.LatestStreamArn

  t.ok(streamArn)

  await new Promise((resolve, reject) => {
    loop = trigger({
      streamArn,
      streams,
      waitTimeSeconds: 0.1,
      trigger (messages) {
        return fn(messages)
      },
      onEmpty () {
        return onEmpty()
      },
      read () {
        return read()
      },
      onReady () {
        resolve()
      },
      waitTimeSeconds: 0.3
    })
  })
})

test('TypeError is thrown when trigger has missing mandatory arguments', async t => {
  t.plan(3)
  try {
    await trigger({})
  } catch (err) {
    t.equals(err.message, 'dynamodb streams must be specified')
  }
  try {
    await trigger({ streams })
  } catch (err) {
    t.equals(err.message, 'trigger must be specified')
  }
  try {
    await trigger({ streams, trigger () {} })
  } catch (err) {
    t.equals(err.message, 'streamArn must be specified')
  }
})

test(`TypeError is thrown when streamArn specified doesn't exist`, async t => {
  t.plan(1)
  try {
    await trigger({ streams, trigger () {}, streamArn: ' ' })
  } catch (err) {
    t.equals(err.message, 'Requested resource not found: Stream:   not found')
  }
})

test('stream single record', async t => {
  await Promise.all([
    new Promise((resolve, reject) => {
      fn = records => {
        t.equals(records.length, 1)
        t.same(records[0].dynamodb, {
          ...records[0].dynamodb,
          Keys: {
            Id: {
              S: '1'
            }
          },
          NewImage: {
            Name: {
              S: 'favicon.ico'
            },
            Id: {
              S: '1'
            }
          },
          StreamViewType: 'NEW_IMAGE'
        })
        resolve()
      }
    }),
    doc
      .put({
        TableName: 'Image',
        Item: {
          Id: '1',
          Name: 'favicon.ico'
        }
      })
      .promise()
  ])
})

test('stream two records', async t => {
  await Promise.all([
    new Promise((resolve, reject) => {
      const actual = []
      fn = records => {
        actual.push(...records)
        if (actual.length < 2) return
        t.same(actual[0].dynamodb, {
          ...actual[0].dynamodb,
          Keys: {
            Id: {
              S: '2'
            }
          },
          NewImage: {
            Name: {
              S: 'shop.png'
            },
            Id: {
              S: '2'
            }
          },
          StreamViewType: 'NEW_IMAGE'
        })
        t.same(actual[1].dynamodb, {
          ...actual[1].dynamodb,
          Keys: {
            Id: {
              S: '3'
            }
          },
          NewImage: {
            Name: {
              S: 'logo.png'
            },
            Id: {
              S: '3'
            }
          },
          StreamViewType: 'NEW_IMAGE'
        })
        resolve()
      }
    }),
    doc
      .put({
        TableName: 'Image',
        Item: {
          Id: '2',
          Name: 'shop.png'
        }
      })
      .promise()
      .then(() =>
        doc
          .put({
            TableName: 'Image',
            Item: {
              Id: '3',
              Name: 'logo.png'
            }
          })
          .promise()
      )
  ])
})

test('loop terminates if read() is false', async t => {
  read = () => false
  await loop
})
