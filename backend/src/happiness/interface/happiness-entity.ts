export interface OrionEntity {
  id: string;
  type: string;
}

export interface HappinessEntity extends OrionEntity {
  happiness1: {
    type: string;
    value: number;
  };
  happiness2: {
    type: string;
    value: number;
  };
  happiness3: {
    type: string;
    value: number;
  };
  happiness4: {
    type: string;
    value: number;
  };
  happiness5: {
    type: string;
    value: number;
  };
  happiness6: {
    type: string;
    value: number;
  };
  timestamp: {
    type: string;
    value: string;
  };
  nickname: {
    type: string;
    value: string;
  };
  location: {
    type: string;
    value: {
      type: string;
      coordinates: [number, number];
    };
    metadata: {
      place: {
        type: string;
        value: string;
      };
    };
  };
  age: {
    type: string;
    value: string;
  };
  address: {
    type: string;
    value: string;
  };
  memo: {
    type: string;
    value: string;
  };
}
