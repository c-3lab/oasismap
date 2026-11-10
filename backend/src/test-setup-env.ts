const SetupEnv = () => {
  process.env['ORION_URI'] = 'http://orion:1026';
  process.env['ORION_FIWARE_SERVICE'] = 'Government';
  process.env['ORION_FIWARE_SERVICE_PATH'] = '/Happiness';
  process.env['ADMIN_KEYCLOAK_CLIENT_ID'] = 'admin';
  process.env['KEYCLOAK_CLIENT_ISSUER'] = 'http://example.com/realms/oasismap';
  process.env['USER_AGENT_EMAIL'] = 'TISI_WB@ml.tisi.jp';
  process.env['APP_VERSION'] = '1.2.5';
  process.env['ORION_NOTIFY_SECRET'] = 'test-notify-secret-0123456789abcdef';
  return;
};

export default SetupEnv;
