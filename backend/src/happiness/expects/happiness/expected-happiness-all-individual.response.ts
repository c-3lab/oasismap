import { HappinessAllResponse } from 'src/happiness/interface/happiness-all.response';

const uuidv4Pattern =
  /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;

export const expectedHappinessAllIndividualResponse: HappinessAllResponse = {
  count: 3,
  data: [
    // Entity 1 - happiness1
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '174f8874-c91c-4242-b34b-aade5b161da7',
      type: 'happiness1',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382], // Converted from [139.72382, 35.629327]
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00', // Converted to Asia/Tokyo timezone
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 1 - happiness2
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '174f8874-c91c-4242-b34b-aade5b161da7',
      type: 'happiness2',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 1 - happiness3
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '174f8874-c91c-4242-b34b-aade5b161da7',
      type: 'happiness3',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 1 - happiness4
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '174f8874-c91c-4242-b34b-aade5b161da7',
      type: 'happiness4',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 1 - happiness5
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '174f8874-c91c-4242-b34b-aade5b161da7',
      type: 'happiness5',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 1 - happiness6
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '174f8874-c91c-4242-b34b-aade5b161da7',
      type: 'happiness6',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.629327, 139.72382],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 2 - happiness1
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '50521f0b-2567-4c2d-b9d3-1550254587e5',
      type: 'happiness1',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168], // Converted from [139.698168, 35.664061]
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00', // Converted to Asia/Tokyo timezone
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 2 - happiness2
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '50521f0b-2567-4c2d-b9d3-1550254587e5',
      type: 'happiness2',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 2 - happiness3
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '50521f0b-2567-4c2d-b9d3-1550254587e5',
      type: 'happiness3',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 2 - happiness4
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '50521f0b-2567-4c2d-b9d3-1550254587e5',
      type: 'happiness4',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 2 - happiness5
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '50521f0b-2567-4c2d-b9d3-1550254587e5',
      type: 'happiness5',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 2 - happiness6
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '50521f0b-2567-4c2d-b9d3-1550254587e5',
      type: 'happiness6',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 3 - happiness1
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '6354de3f-e40a-4e8f-9a59-d0ffec608c3e',
      type: 'happiness1',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.707977, 139.752472], // Converted from [139.752472, 35.707977]
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00', // Converted to Asia/Tokyo timezone
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 3 - happiness2
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '6354de3f-e40a-4e8f-9a59-d0ffec608c3e',
      type: 'happiness2',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.707977, 139.752472],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 3 - happiness3
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '6354de3f-e40a-4e8f-9a59-d0ffec608c3e',
      type: 'happiness3',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.707977, 139.752472],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 3 - happiness4
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '6354de3f-e40a-4e8f-9a59-d0ffec608c3e',
      type: 'happiness4',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.707977, 139.752472],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 3 - happiness5
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '6354de3f-e40a-4e8f-9a59-d0ffec608c3e',
      type: 'happiness5',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.707977, 139.752472],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 1,
        happiness4: 0,
        happiness5: 1,
        happiness6: 1,
      },
    },
    // Entity 3 - happiness6
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '6354de3f-e40a-4e8f-9a59-d0ffec608c3e',
      type: 'happiness6',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.707977, 139.752472],
        },
      },
      timestamp: '2024-03-16T14:02:38.150+09:00',
      memo: 'ダミーメモ',
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
};
