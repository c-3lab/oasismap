import { HappinessResponse } from 'src/happiness/interface/happiness.response';

const uuidv4Pattern =
  /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;
export const expectedHappinessInputResponse: HappinessResponse = {
  message: 'Happiness has been sent.',
  entity_id: expect.stringMatching(uuidv4Pattern),
};
