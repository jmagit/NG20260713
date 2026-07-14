import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
// import { environment } from 'src/environments/environment';

export const ERROR_LEVEL = new InjectionToken<number>('ERROR_LEVEL')
// export const ERROR_LEVEL = new InjectionToken<number>('ERROR_LEVEL', { providedIn: 'root', factory: () => environment.ERROR_LEVEL})

@Injectable({providedIn: 'root'})
export class LoggerService {
  private readonly nivel: number

  constructor(@Optional() @Inject(ERROR_LEVEL) nivel?: number) {
    this.nivel = nivel ?? 99
  }

  public error(message: string): void {
    if (this.nivel > 0) {
      console.error(message)
    }
  }

  public warn(message: string): void {
    if (this.nivel > 1) {
      console.warn(message)
    }
  }

  public info(message: string): void {
    if (this.nivel > 2) {
      if (console.info) {
        console.info(message)
      } else {
        console.log(message)
      }
    }
  }

  public log(message: string): void {
    if (this.nivel > 3) {
      console.log(message)
    }
  }
}
