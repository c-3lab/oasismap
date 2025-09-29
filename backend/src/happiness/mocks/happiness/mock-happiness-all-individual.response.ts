import { HappinessAllResponse } from 'src/happiness/interface/happiness-all.response';

export const mockHappinessAllIndividualResponse: HappinessAllResponse = {
  count: 18, // 3 entities × 6 happiness types each
  data: [
    // Entity 1 - happiness1
    {
      id: '48d38719-d4ff-441e-9d83-c1d94aa01857',
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
      id: '8db9e10f-6b78-4f50-bc73-2178c46248fe',
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
      id: 'ad264b7b-6531-42c4-b179-4b2e0c41336a',
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
      id: 'fc845b43-1d2f-43bb-afce-d1585d9a37b7',
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
      id: 'ab8c23f6-52dd-421a-866a-ce22981762c7',
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
      id: '51ac1487-0736-451d-b029-744c4cd4bdf2',
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
      id: 'ccd7930a-8359-4da4-be99-60820e323f05',
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
      id: '6f5697b9-a464-4641-a456-c9354d7384d0',
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
      id: '7503a92d-c28b-4e36-b50a-fad3ae799209',
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
      id: 'cc531d83-ae85-4623-95c1-3fca32aab8ca',
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
      id: 'acb0cc31-578f-4819-b3ae-36d03861ded9',
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
      id: 'dc4e534e-008a-41df-9670-5988edf64b1a',
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
      id: 'e00692d3-3d3d-47e3-ae86-b51ac8d1e244',
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
      id: 'ce000887-1573-44d7-a8f3-bbb493613b17',
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
      id: '48bade53-7e8c-4a8a-815a-c4b4ff113611',
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
      id: '05e146d5-028a-4645-8664-705d9fd49093',
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
      id: '47c3ffbc-8279-4e82-a996-f5183fb25455',
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
      id: '23422704-c086-40d4-9818-5863c65a665a',
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
