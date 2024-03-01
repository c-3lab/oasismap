export class GetHappinessAllDto {
  readonly start: string;
  readonly end: string;
  readonly period: 'time' | 'date' | 'month';
  readonly zoomLevel: number;
}
