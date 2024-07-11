export interface HappinessListResponse {
  count: number;
  data: Data[];
}

export interface Data {
  id: string;
  location: {
    value: {
      coordinates: [number, number];
    };
    place: string;
  };
  timestamp: string;
  memo: string;
  answers: {
    happiness1: number;
    happiness2: number;
    happiness3: number;
    happiness4: number;
    happiness5: number;
    happiness6: number;
  };
}
