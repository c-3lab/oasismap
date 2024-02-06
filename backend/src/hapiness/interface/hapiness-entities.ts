export interface HappinessEntities {
  id: string;
  type: string;
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
  time: {
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
}
