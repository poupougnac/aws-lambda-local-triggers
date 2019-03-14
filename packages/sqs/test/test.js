const trigger = require('../')
const sqs = require('./sqs')()
const { test } = require('tap')

let onEmpty = f => f
let read = f => true
let fn = null

const loop = trigger({
  queueUrl: 'http://localhost:9324/queue/test',
  sqs,
  waitTimeSeconds: 0.1,
  trigger (messages) {
    return fn(messages)
  },
  onEmpty () {
    return onEmpty()
  },
  read () {
    return read()
  }
})

test('TypeError is thrown when trigger has missing mandatory arguments', async t => {
  t.plan(3)
  try {
    await trigger({})
  } catch (err) {
    t.equals(err.message, 'sqs must be specified')
  }
  try {
    await trigger({ sqs })
  } catch (err) {
    t.equals(err.message, 'trigger must be specified')
  }
  try {
    await trigger({ sqs, trigger () {} })
  } catch (err) {
    t.equals(err.message, 'queueUrl must be specified')
  }
})

test('onEmpty is called when no messages arrive in queue', async t => {
  await new Promise((resolve, reject) => {
    onEmpty = resolve
  })
})

test('a simple string message', async t => {
  await Promise.all([
    new Promise((resolve, reject) => {
      fn = ([message]) => t.equals(message.body, 'x') && resolve()
    }),
    sqs
      .sendMessage({
        QueueUrl: 'http://localhost:9324/queue/test',
        MessageBody: 'x'
      })
      .promise()
  ])
})

test('a simple json message', async t => {
  await Promise.all([
    new Promise((resolve, reject) => {
      fn = ([message]) => t.equals(JSON.parse(message.body).y, 'y') && resolve()
    }),
    sqs
      .sendMessage({
        QueueUrl: 'http://localhost:9324/queue/test',
        MessageBody: JSON.stringify({ y: 'y' })
      })
      .promise()
  ])
})

test('a simple message batch', async t => {
  await Promise.all([
    new Promise((resolve, reject) => {
      fn = messages => {
        t.same(
          { a: 'a', b: 'b', c: 'c' },
          messages.map(x => JSON.parse(x.body)).reduce((sum, item) => {
            sum[item.a || item.b || item.c] = item.a || item.b || item.c
            return sum
          }, {})
        )
        resolve()
      }
    }),
    sqs
      .sendMessageBatch({
        QueueUrl: 'http://localhost:9324/queue/test',
        Entries: ['a', 'b', 'c'].map(x => ({
          Id: x,
          MessageBody: JSON.stringify({ [x]: x })
        }))
      })
      .promise()
  ])
})

test('loop terminates if read() is false', async t => {
  read = () => false
  await loop
})
