module.exports = async ({
  sqs,
  trigger,
  onEmpty = f => f,
  read = () => true,
  queueUrl,
  waitTimeSeconds = 10
}) => {
  if (!sqs) throw new TypeError('sqs must be specified')
  if (!trigger) throw new TypeError('trigger must be specified')
  if (!queueUrl) throw new TypeError('queueUrl must be specified')

  const params = { QueueUrl: queueUrl, WaitTimeSeconds: waitTimeSeconds }

  while (await read()) {
    const { Messages: messages } = await new Promise((resolve, reject) => {
      sqs.receiveMessage(
        params,
        (err, data) => (err ? reject(err) : resolve(data))
      )
    })
    if (!messages) {
      onEmpty()
      continue
    }
    for (const message of messages) {
      message.body = message.Body
      delete message.Body
    }
    await trigger(messages)

    await new Promise((resolve, reject) => {
      sqs.deleteMessageBatch(
        {
          QueueUrl: params.QueueUrl,
          Entries: messages.map(x => ({
            Id: x.MessageId,
            ReceiptHandle: x.ReceiptHandle
          }))
        },
        err => (err ? reject(err) : resolve())
      )
    })
  }
}
