# durablefunctiontest

Based on [this](https://docs.microsoft.com/en-us/azure/azure-functions/durable/quickstart-js-vscode) quickstart guide.

Prequisites
  * See [prerequisites](https://docs.microsoft.com/en-us/azure/azure-functions/durable/quickstart-js-vscode#prerequisites) in quickstart guide above 
  * You may need to add WEBSITE_HOSTNAME=localhost:7071 to your environment (e.g. see [here](https://stackoverflow.com/questions/53812188/cannot-run-azure-durable-function-locally-via-visual-studio-code) for more details as to when and why).
  * A `local.settings.file` (see [below](#sample-localsettingsfile) for a sample)

To run in VS Code:
  * F5 (or ^F5 to run without debugging)
  * Using curl/postman/etc POST to http://localhost:7071/api/orchestrators/OrchestratorFunction. This will return a 202 and a status check URL in a Location header (or alternatively as 'statusQueryGetUri' in the body of the response). 
  * Use the Location/statusQueryGetUri URL to see status and results

Note: found a couple of errors in the quick start guide:
  * Renamed E1_SayHello to SayHello in `OrchestratorFunction/index.js`
  * Use the POST URL above not the 'GET HttpTrigger' one in the guide. This is why you need to use something like Postman or curl rather than Chrome 

## Sample local.settings.file

```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "[Add azure storage connection string here]",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```
