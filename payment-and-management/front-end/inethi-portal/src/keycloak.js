import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://keycloak.inethilocal.net/auth',
  realm: 'Master',
  clientId: 'portal',
  useRedirects: true, // Set this property to true
});

export default keycloak;