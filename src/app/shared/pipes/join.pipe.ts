import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "join",
})
export class JoinPipe implements PipeTransform {
  transform(input: [], field: string): string {
    return input?.map((i) => i[field]).join(`, `);
  }
}
