export interface HappinessMeResponse {
  count: number;
  data: Data[];
}

export interface Data {
  id: string;
  entityId: string;
  type: string;
  location: {
    type: string;
    value: {
      type: string;
      coordinates: [number, number];
    };
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
