import { HappinessMeResponse } from 'src/happiness/interface/happiness-me.response';

// Generate pins using the same logic as the service
const generatePinsFromBase = (count: number) => {
  const pins = [];

  const baseLat = 35.6762;
  const baseLng = 139.6503;
  const latRange = 1.0;
  const lngRange = 1.0;
  const happinessKeys = [
    'happiness1',
    'happiness2',
    'happiness3',
    'happiness4',
    'happiness5',
    'happiness6',
  ];

  for (let i = 0; i < count; i++) {
    const randomLat = baseLat + (Math.random() - 0.5) * latRange;
    const randomLng = baseLng + (Math.random() - 0.5) * lngRange;
    const answers = {
      happiness1: 0,
      happiness2: 0,
      happiness3: 0,
      happiness4: 0,
      happiness5: 0,
      happiness6: 0,
    };
    const numHappinessTypes = Math.floor(Math.random() * 6) + 1;
    const selectedKeys = [];
    for (let j = 0; j < numHappinessTypes; j++) {
      const availableKeys = happinessKeys.filter(
        (key) => !selectedKeys.includes(key),
      );
      if (availableKeys.length > 0) {
        const randomKey =
          availableKeys[Math.floor(Math.random() * availableKeys.length)];
        selectedKeys.push(randomKey);
        answers[randomKey as keyof typeof answers] = 1;
      }
    }

    const maxValue = Math.max(...Object.values(answers));
    const primaryType = Object.keys(answers).find(
      (key) => answers[key as keyof typeof answers] === maxValue,
    ) as string;

    pins.push({
      id: `pin-${Date.now()}-${i}`,
      entityId: `entity-${Date.now()}-${i}`,
      type: primaryType,
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [randomLat, randomLng] as [number, number],
        },
      },
      timestamp: new Date().toISOString(),
      memo: `Pin ${i} with ${numHappinessTypes} happiness types`,
      answers: answers,
    });
  }

  return pins;
};

export const mockHappinessMeResponse: HappinessMeResponse = {
  count: 1000,
  data: generatePinsFromBase(1000),
};
