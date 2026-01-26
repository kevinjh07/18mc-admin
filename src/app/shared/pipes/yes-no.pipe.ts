import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'yesNo'
})
export class YesNoPipe implements PipeTransform {

  transform(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

}

