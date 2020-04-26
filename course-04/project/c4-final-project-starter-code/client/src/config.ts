// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'uyd17c5dnh';
const regionId = 'eu-west-1';
export const apiEndpoint = `https://${apiId}.execute-api.${regionId}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-wlv37ndj.eu.auth0.com',            // Auth0 domain
  clientId: 'E5ps2ToI1FIsIo2npm9BbLv3BzKBbaFp',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

