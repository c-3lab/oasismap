import { HappinessListResponse } from 'src/happiness/interface/happiness-list.response';

export const mockHappinessListResponse: HappinessListResponse = {
  count: 2,
  data: [
    {
      id: '42ec444a-1e9f-499b-9db2-581f49ceb1bd',
      location: {
        value: {
          coordinates: [35.629327, 139.72382],
        },
        place: '東京都品川区',
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
      id: 'b4395c94-54af-4853-b6d8-a20bf8905240',
      location: {
        value: {
          coordinates: [35.664061, 139.698168],
        },
        place: '東京都渋谷区',
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
