import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'exec'
})
export class ExecPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any
  transform(fn: Function, ...args: any[]): any {
    return fn(...args);
  }
}
