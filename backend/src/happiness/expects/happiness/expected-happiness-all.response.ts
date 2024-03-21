import { HappinessAllResponse } from 'src/happiness/interface/happiness-all.response';

const uuidv4Pattern =
  /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;
export const expectedHappinesAllResponse: HappinessAllResponse = {
  map_data: [
    {
      id: expect.stringMatching(uuidv4Pattern),
      type: 'happiness1',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.62158189955968, 139.72412109375],
        },
      },
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
          coordinates: [35.62158189955968, 139.72412109375],
        },
      },
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
          coordinates: [35.62158189955968, 139.72412109375],
        },
      },
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
          coordinates: [35.62158189955968, 139.72412109375],
        },
      },
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
          coordinates: [35.62158189955968, 139.72412109375],
        },
      },
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
          coordinates: [35.62158189955968, 139.72412109375],
        },
      },
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
          coordinates: [35.65729624809628, 139.68017578125],
        },
      },
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
          coordinates: [35.65729624809628, 139.68017578125],
        },
      },
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
          coordinates: [35.65729624809628, 139.68017578125],
        },
      },
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
          coordinates: [35.65729624809628, 139.68017578125],
        },
      },
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
          coordinates: [35.65729624809628, 139.68017578125],
        },
      },
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
          coordinates: [35.65729624809628, 139.68017578125],
        },
      },
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
          coordinates: [35.6929946320988, 139.76806640625],
        },
      },
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
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
          coordinates: [35.6929946320988, 139.76806640625],
        },
      },
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
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
          coordinates: [35.6929946320988, 139.76806640625],
        },
      },
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
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
          coordinates: [35.6929946320988, 139.76806640625],
        },
      },
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
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
          coordinates: [35.6929946320988, 139.76806640625],
        },
      },
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
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
          coordinates: [35.6929946320988, 139.76806640625],
        },
      },
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
        happiness5: 1,
        happiness6: 1,
      },
    },
  ],
  graph_data: [
    {
      timestamp: '2024-03-15T00:00:00.000+09:00',
      happiness1: 0,
      happiness2: 0,
      happiness3: 0,
      happiness4: 0,
      happiness5: 0,
      happiness6: 0,
    },
    {
      timestamp: '2024-03-16T00:00:00.000+09:00',
      happiness1: 1,
      happiness2: 0.5,
      happiness3: 1,
      happiness4: 0.5,
      happiness5: 1,
      happiness6: 1,
    },
    {
      timestamp: '2024-03-17T00:00:00.000+09:00',
      happiness1: 0,
      happiness2: 0,
      happiness3: 0,
      happiness4: 0,
      happiness5: 0,
      happiness6: 0,
    },
    {
      timestamp: '2024-03-18T00:00:00.000+09:00',
      happiness1: 1,
      happiness2: 1,
      happiness3: 1,
      happiness4: 1,
      happiness5: 1,
      happiness6: 1,
    },
    {
      timestamp: '2024-03-19T00:00:00.000+09:00',
      happiness1: 0,
      happiness2: 0,
      happiness3: 0,
      happiness4: 0,
      happiness5: 0,
      happiness6: 0,
    },
    {
      timestamp: '2024-03-20T00:00:00.000+09:00',
      happiness1: 0,
      happiness2: 0,
      happiness3: 0,
      happiness4: 0,
      happiness5: 0,
      happiness6: 0,
    },
  ],
};
