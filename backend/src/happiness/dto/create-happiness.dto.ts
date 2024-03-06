export class CreateHappinessDto {
  readonly latitude: number;
  readonly longitude: number;
  readonly answers: {
    happiness1: number;
    happiness2: number;
    happiness3: number;
    happiness4: number;
    happiness5: number;
    happiness6: number;
  };
}
