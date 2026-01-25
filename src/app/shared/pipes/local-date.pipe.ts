import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  standalone: false,
  name: 'localDate'
})
export class LocalDatePipe implements PipeTransform {

  transform(value: Date, args: string): string {
    if (!value || !args) {
      return '';
    }
    const dateFnsFormat = args
      .replace(/DD/g, 'dd')
      .replace(/YYYY/g, 'yyyy');
      
    const localDate = new Date(value.getTime() - (value.getTimezoneOffset() * 60000));
    return format(localDate, dateFnsFormat);
  }

}

