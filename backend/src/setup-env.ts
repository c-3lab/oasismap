
require('dotenv').config();

const SetupEnv = () => {
    process.env['ADMIN_KEYCLOAK_CLIENT_ID'] = 'admin';
    process.env['KEYCLOAK_CLIENT_ISSUER'] = 'sample';
    return;
  };
  
export default SetupEnv;