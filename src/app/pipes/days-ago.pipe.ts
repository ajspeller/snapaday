import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysAgo',
})
export class DaysAgoPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): unknown {
    const now = new Date();
    const takenDate = new Date(value);
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(
      Math.abs((takenDate.getTime() - now.getTime()) / oneDayInMs)
    );
    return diffDays;
  }
}
