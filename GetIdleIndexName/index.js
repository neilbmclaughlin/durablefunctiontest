const rp = require('request-promise-native');

async function azureSearchRequest(searchUrl, method, body) {
  const searchApiVersion = process.env['search-api-version'];
  const searchApiAdminKey = process.env['search-api-admin-key'];
  const headers = {
    'Content-Type': 'application/json',
    'api-key':  searchApiAdminKey
  }
  url = `${searchUrl}?api-version=${searchApiVersion}`;
  const response = await rp({
    body,
    headers,
    method: method,
    url: url,
    simple: false,
    resolveWithFullResponse: true
  });

  return {
    statusCode: response.statusCode,
    body: response.body ? JSON.parse(response.body ) : null
  };
}

async function azureApimRequest() {
  const apimApiVersion = process.env['apim-api-version'];
  const apimAuthorizationToken = process.env['apim-authorization-token'];
  const apimHostName = process.env['apim-host-name'];
  const apimServiceName = process.env['apim-service-name'];
  const apimSubscription = process.env['apim-subscription'];
  const apimResourceGroup = process.env['apim-resource-group'];
  const apimApiName = process.env['apim-api-name'];

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': apimAuthorizationToken,
  };
  const url = `https://${apimHostName}/subscriptions/${apimSubscription}/resourceGroups/${apimResourceGroup}/providers/Microsoft.ApiManagement/service/${apimServiceName}/apis/${apimApiName}?api-version=${apimApiVersion}`;

  const response = await rp({
    headers,
    method: 'GET',
    url:  url
  });

  return JSON.parse(response);

}

function getIndexName(index, deployment) {
  return `${index.name}-${index.version}-${deployment}-${index.environment}`
}

function getIndexUrl(index, deployment) {
  const indexName = getIndexName(index, deployment);
  return `${index.baseUrl}${indexName}`
}

function getIdleIndexDeployment(activeDeployment) {
  switch(activeDeployment) {
    case 'a':
      return 'b';
    case 'b':
      return 'a';
    default:
      throw "ERROR: No 'a' or 'b' search index found!!"
  }
}

async function getIndexDetails() {

  const response = await azureApimRequest();

  const activeServiceUrl = response.properties.serviceUrl;

  const urlRegex = /(https:\/\/.*\/indexes\/)(.*)(\/docs\/)/u;
  const indexNameRegex = /(.*)-([0-9]+-[0-9]+)-(a|b|)-(dev|int|prod)/u;

  const indexName =  activeServiceUrl.match(urlRegex)[2];

  const indexDetails = {
    "baseUrl": activeServiceUrl.match(urlRegex)[1],
    "trailingPath": activeServiceUrl.match(urlRegex)[3],
    "name": indexName.match(indexNameRegex)[1],
    "version": indexName.match(indexNameRegex)[2],
    "activeDeployment": indexName.match(indexNameRegex)[3],
    "environment": indexName.match(indexNameRegex)[4],
  }

  indexDetails.idleDeployment = getIdleIndexDeployment(indexDetails.activeDeployment);

  indexDetails.activeIndexName = getIndexName(indexDetails, indexDetails.activeDeployment);
  indexDetails.activeIndexUrl = getIndexUrl(indexDetails, indexDetails.activeDeployment);
  indexDetails.idleIndexName = getIndexName(indexDetails, indexDetails.idleDeployment);
  indexDetails.idleIndexUrl = getIndexUrl(indexDetails, indexDetails.idleDeployment);

  return indexDetails;
}

async function createIdleIndex(idleIndexUrl, activeIndexUrl) {
  const activeIndexResponse = await azureSearchRequest(activeIndexUrl, 'get');
  if (activeIndexResponse.statusCode == 200) {
    let activeIndexDefinition = activeIndexResponse.body; 
    delete activeIndexDefinition.name
    const deleteResponse = await azureSearchRequest(idleIndexUrl, 'delete');
    const postResponse = await azureSearchRequest(idleIndexUrl, 'put', JSON.stringify(activeIndexDefinition));
  }
  return 'created';
}

async function reindex(idleIndexName) {
  const searchHostname = process.env["search-hostname"]
  const indexerName = process.env["search-indexer-name"]
  const indexerUrl = `https://${searchHostname}/indexers/${indexerName}`
  const indexerResponse = await azureSearchRequest(indexerUrl, 'get');
  if (indexerResponse.statusCode == 200) {
    const indexerDefinition = indexerResponse.body;
    indexerDefinition.targetIndexName = idleIndexName;
    delete indexerDefinition.name
    const postResponse = await azureSearchRequest(indexerUrl, 'put', JSON.stringify(indexerDefinition));
    // Todo: The reindexing itself is needs to be in it's own function so it can be orchestrated using the monitor pattern:
    // https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-concepts#monitoring
    // const runResponse = await azureSearchRequest(`${indexerUrl}/run`, 'post');
  }

   return 'reindexing';
}

module.exports = async function(context) {

  result = [];
  const indexDetails = await getIndexDetails();
  result.push(await createIdleIndex(indexDetails.idleIndexUrl, indexDetails.activeIndexUrl));
  result.push(await reindex(indexDetails.idleIndexName));

  return result;

  //Wait for reindexing to complete
  //Switch APIM to point to idle index

};
