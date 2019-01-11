const rp = require('request-promise-native');

function createBody() {
    return {};
}

async function azureRequest(type, locals) {
    const apimApiVersion = process.env['apim-api-version'];
    const apimAuthorizationToken = process.env['apim-authorization-token'];
    const apimHostname = process.env['apim-hostname'];
    const apimSubscription = process.env['apim-subscription'];

    const query = createBody(type, locals);
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': apimAuthorizationToken,
    }

    return rp({
      headers,
      method: 'GET',
      url: `https://${apimHostname}/subscriptions/${apimSubscription}/resourceGroups/Api-Default-North-Europe/providers/Microsoft.ApiManagement/service/nhsapidev/apis/service-search-organisations-2?api-version=${apimApiVersion}`,
    });
  }


module.exports = async function(context) {

    const body = {};

    const response = await azureRequest(body);

    jsonResponse = JSON.parse(response);

    console.log(jsonResponse.properties);

    const activeServiceUrl = properties.serviceUrl;

    const urlRegex = /(https:\/\/.*\/indexes\/)(.*)(\/docs\/)/u;
    const indexNameRegex = /(.*)-([0-9]+-[0-9]+)-(a|b|)-(dev|int|prod)/u;
    
    const indexName =  activeServiceUrl.match(urlRegex)[2];

    const activeIndex = {
      "descriptiveName": indexName.match(indexNameRegex)[1],
      "version": indexName.match(indexNameRegex)[2],
      "deployment": indexName.match(indexNameRegex)[3],
      "environment": indexName.match(indexNameRegex)[3],
    }

    if (activeIndex.deployment === 'a' ) {
        idleDeployment = 'b';
    } else if (activeIndex.deployment === 'b' ) {
        idleDeployment = 'a';
    } else {
        throw "ERROR: No 'a' or 'b' search index found!!"
    }

    activeIndex.deployment = idleDeployment;

    return {  activeIndex };
};
