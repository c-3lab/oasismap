const SetupEnv = () => {
  process.env['ORION_URI'] = 'http://orion:1026';
  process.env['ORION_FIWARE_SERVICE'] = 'Government';
  process.env['ORION_FIWARE_SERVICE_PATH'] = '/Happiness';
  return;
};

export default SetupEnv;
