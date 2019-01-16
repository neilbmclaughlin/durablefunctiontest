const df = require("durable-functions");
const moment = require("moment");

module.exports = df.orchestrator(function*(context){
  context.log("Starting chain sample");
  const idleIndexName = yield context.df.callActivity("GetIdleIndexName");
  const result = yield context.df.callActivity("ReIndex");
  const polling = { interval: 60, units: 'seconds' };
  const expiryTime = moment().add(polling.interval * 15, polling.units);

  while (moment.utc(context.df.currentUtcDateTime).isBefore(expiryTime))  {
    // Wait until reindexing is underway before first checking status
    const nextCheck =
      moment.utc(context.df.currentUtcDateTime).add(polling.interval, polling.units);
    yield context.df.createTimer(nextCheck.toDate());
    const indexerStatus = yield context.df.callActivity("GetIndexerStatus");
    if (indexerStatus === 'success') {
        //TODO: Switch APIM to point to idle index
        //TODO: send notification
        return 'done'
    } else if (indexerStatus !== 'inProgress') {
      return 'failed: indexer failed';
    }
  }

  return 'failed: OrchestratorFunction/index.js timed out';
});
