export interface NgsiMetadataItem {
  type: string;
  value: string | number;
}
export interface NgsiMetadataArrayItem {
  name: string;
  type: string;
  value: string | number;
}

export interface OrionAttribute<T> {
  type: string;
  value: T;
  metadata: Record<string, NgsiMetadataItem>;
}

export interface OrionLocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface OrionNotificationEntity {
  id: string;
  type: string;

  happiness1: OrionAttribute<number>;
  happiness2: OrionAttribute<number>;
  happiness3: OrionAttribute<number>;
  happiness4: OrionAttribute<number>;
  happiness5: OrionAttribute<number>;
  happiness6: OrionAttribute<number>;

  timestamp: OrionAttribute<string>;

  nickname: OrionAttribute<string>;
  age: OrionAttribute<string>;
  address: OrionAttribute<string>;
  memo: OrionAttribute<string>;

  location: OrionAttribute<OrionLocation>;
}
