import { Data } from './happiness-me.response';

export interface HappinessAllResponse {
  count: number;
  data?: Data[]; // Optional for individual data
}

export interface MapData {
  count: number;
  data: MapDataItem[];
}

export interface MapDataItem {
  id: string;
  type: string;
  location: {
    type: string;
    value: {
      type: string;
      coordinates: [number, number];
    };
  };
  answers: {
    happiness1: number;
    happiness2: number;
    happiness3: number;
    happiness4: number;
    happiness5: number;
    happiness6: number;
  };
  memos: {
    timestamp: string;
    memo: string;
  }[];
}
