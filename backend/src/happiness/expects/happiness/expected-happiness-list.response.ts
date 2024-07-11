import { HappinessListResponse } from 'src/happiness/interface/happiness-list.response';

export const expectedHappinessListResponse: HappinessListResponse = {
  count: 2,
  data: [
    {
      id: '174f8874-c91c-4242-b34b-aade5b161da7',
      location: {
        value: {
          coordinates: [35.629327, 139.72382],
        },
        place: '東京都品川区',
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
      id: '50521f0b-2567-4c2d-b9d3-1550254587e5',
      location: {
        value: {
          coordinates: [35.664061, 139.698168],
        },
        place: '東京都渋谷区',
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
