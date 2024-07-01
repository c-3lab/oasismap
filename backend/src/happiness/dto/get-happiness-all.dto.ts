export class GetHappinessAllDto {
  readonly limit: string;
  readonly offset: string;
  readonly start: string;
  readonly end: string;
  readonly period: 'time' | 'day' | 'month';
  readonly zoomLevel: number;
}
