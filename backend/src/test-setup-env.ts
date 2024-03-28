const SetupEnv = () => {
  process.env['ORION_URI'] = 'http://orion:1026';
  process.env['ORION_FIWARE_SERVICE'] = 'Government';
  process.env['ORION_FIWARE_SERVICE_PATH'] = '/Happiness';
  process.env['ADMIN_KEYCLOAK_CLIENT_ID'] = 'admin';
  process.env['KEYCLOAK_CLIENT_ISSUER'] = 'http://example.com';
  return;
};

export default SetupEnv;
