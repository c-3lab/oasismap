export interface HappinessMeResponse {
  id: string;
  type: string;
  location: {
    type: string;
    value: {
      type: string;
      coordinates: [number, number];
    };
  };
  timestamp: {
    type: string;
    value: string;
  };
  answers: {
    happiness1: number;
    happiness2: number;
    happiness3: number;
    happiness4: number;
    happiness5: number;
    happiness6: number;
  };
}
