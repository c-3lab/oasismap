export class GetHappinessAllDto {
  readonly start: string;
  readonly end: string;
  readonly period: 'time' | 'day' | 'month';
  readonly zoomLevel: number;
}
