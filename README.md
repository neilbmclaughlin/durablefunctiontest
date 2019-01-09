# durablefunctiontest

Based on [this](https://docs.microsoft.com/en-us/azure/azure-functions/durable/quickstart-js-vscode) quickstart guide.

Prequisites
  * See quickstart guide above
  * Add WEBSITE_HOSTNAME=localhost:7071 to your environment (e.g. add to ~/.bashrc on MacOS, see [here](https://stackoverflow.com/questions/53812188/cannot-run-azure-durable-function-locally-via-visual-studio-code) for more details   

To run in VS Code:
  * F5 (or ^F5 to run without debugging)
  * Using curl/postman/etc POST to http://localhost:7071/api/orchestrators/OrchestratorFunction. This will return a 202 and a status check URL in a Location header (or alternatively in the body of the response). 
  * Use the Location URL to see status and results

Note: found a couple of errors in the quick start guide:
  * Renamed E1_SayHello to SayHello in `OrchestratorFunction/index.js`
  * Use the POST URL above not the 'GET HttpTrigger' one in the guide. This is why you need to use something like Postman or curl rather than Chrome 
