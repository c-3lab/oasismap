import { HappinessMeResponse } from 'src/happiness/interface/happiness-me.response';

const uuidv4Pattern =
  /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;
export const expectedHappinessMeResponse: HappinessMeResponse = {
  count: 2,
  data: [
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness1',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness2',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness3',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness4',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness5',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness6',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness1',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness2',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness3',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness4',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness5',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness6',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
  ],
};
