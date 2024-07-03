export interface HappinessAllResponse {
  map_data: MapData[];
  graph_data: GraphData[];
}

export interface MapData {
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
}

export interface GraphData {
  timestamp: string;
  happiness1: number;
  happiness2: number;
  happiness3: number;
  happiness4: number;
  happiness5: number;
  happiness6: number;
}
