/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class EventData {
  constructor(private name: symbol, private value?: any) {}
  public get Name() { return this.name }
  public get EventName() { return this.name.toString() }
  public get Value() { return this.value }
}

/**
 * El patrón Event Bus básicamente permite a objetos suscribirse a ciertos eventos del Bus,
 * de modo que cuando un evento es publicado en el Bus se propaga a cualquier suscriptor interesado.
 */
@Service()
export class EventBusService {
  private subject$ = new Subject<EventData>();

  emit(event: EventData): void;
  emit(name: symbol, value?: any): void;
  emit(eventOrName: EventData | symbol, value?: any): void {
    if (eventOrName instanceof EventData) {
      this.subject$.next(eventOrName);
    } else {
      this.subject$.next(new EventData(eventOrName ?? '', value))
    }
  }

  on(eventName: symbol, action: any): Subscription {
    return this.subject$.pipe(
      filter((e: EventData) => e.Name === eventName),
      map((e: EventData) => e.Value)
    ).subscribe(action);
  }
}
