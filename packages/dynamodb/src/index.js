module.exports = async ({
  streams,
  trigger,
  onEmpty = f => f,
  read = () => true,
  onReady = f => f,
  streamArn,
  waitTimeSeconds = 10
}) => {
  if (!streams) throw new TypeError('dynamodb streams must be specified')
  if (!trigger) throw new TypeError('trigger must be specified')
  if (!streamArn) throw new TypeError('streamArn must be specified')

  const stream = await streams
    .describeStream({ StreamArn: streamArn })
    .promise()

  if (!stream) throw new TypeError(`stream with ${streamArn} couldn't be found`)

  const { ShardId: shardId } =
    stream.StreamDescription.Shards.filter(
      x =>
        x.SequenceNumberRange &&
        x.SequenceNumberRange.StartingSequenceNumber &&
        !x.SequenceNumberRange.EndingSequenceNumber
    )[0] || {}

  if (!shardId) throw new Error('no open shard available')

  const { ShardIterator: start } = await streams
    .getShardIterator({
      StreamArn: streamArn,
      ShardId: shardId,
      ShardIteratorType: 'LATEST'
    })
    .promise()

  let iterator = start

  onReady()

  while (iterator && (await read())) {
    const data = await streams.getRecords({ ShardIterator: iterator }).promise()
    iterator = data.NextShardIterator
    if (data.Records.length) {
      await trigger(data.Records)
    } else {
      await onEmpty()
    }
    await new Promise((resolve, reject) => setTimeout(resolve, waitTimeSeconds * 1000))
  }
}
