const df = require("durable-functions");

module.exports = df.orchestrator(function*(context){
    context.log("Starting chain sample");
    const output = [];
    output.push(yield context.df.callActivity("GetIdleIndexName"));
    output.push(yield context.df.callActivity("SayHello", "Tokyo"));
    output.push(yield context.df.callActivity("SayHello", "Seattle"));
    return output;
});
