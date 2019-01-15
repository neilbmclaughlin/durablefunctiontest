const df = require("durable-functions");

module.exports = df.orchestrator(function*(context){
  //TODO: singleton orchestrations - https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-singletons
  //Wait for reindexing to complete
  //Switch APIM to point to idle index
  // https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-concepts#monitoring
  context.log("Starting chain sample");
  const idleIndexName = yield context.df.callActivity("GetIdleIndexName");
  const result = yield context.df.callActivity("ReIndex", idleIndexName);
  return 'done';
});
