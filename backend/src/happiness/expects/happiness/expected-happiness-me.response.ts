import { HappinessMeResponse } from 'src/happiness/interface/happiness-me.response';

const uuidv4Pattern =
  /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;
export const expectedHappinessMeResponse: HappinessMeResponse = {
  count: 2,
  data: [
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '174f8874-c91c-4242-b34b-aade5b161da7',
      type: 'happiness1',
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
    {
      id: expect.stringMatching(uuidv4Pattern),
      entityId: '50521f0b-2567-4c2d-b9d3-1550254587e5',
      type: 'happiness1',
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [35.664061, 139.698168],
        },
      },
      timestamp: '2024-03-18T14:02:38.150+09:00',
      memo: '',
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
      memo: '',
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
      memo: '',
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
      memo: '',
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
      memo: '',
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
      memo: '',
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
