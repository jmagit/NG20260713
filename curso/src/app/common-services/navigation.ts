import { Router, NavigationEnd, ActivationStart, GuardsCheckEnd } from '@angular/router';

import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LoggerService } from '@my-library';

// en src/app/app.config.ts
// provideEnvironmentInitializer(() => inject(NavigationService)),
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly MAX_CACHE = 5;
  private history: string[] = [];

  constructor() {
    const title = inject(Title);
    const router = this.router;
    const logger = this.logger;

    router.events.subscribe((e) => {
      if (e instanceof ActivationStart) {
        if (e.snapshot?.data?.['pageTitle']) {
          title.setTitle(e.snapshot.data['pageTitle']);
        } else {
          title.setTitle('Curso de Angular');
        }
      }
      if (e instanceof NavigationEnd && !e.url.includes('/login')) {
        this.history.push(e.url);
        if (this.history.length > this.MAX_CACHE) this.history.splice(0, 1);
        logger.log(`${this.history.length} NavigationEnd ${e.url}`);
      }
      if (e instanceof GuardsCheckEnd) {
        const ev = e as GuardsCheckEnd;
        logger.log(`GuardsCheckEnd to ${e.url}: ${ev.shouldActivate}`);
      }
    });
  }

  back(defecto: string = '/', delta: number = 1) {
    while (delta && this.history.length > 0) {
      this.history.pop();
      delta--;
    }
    const url = this.history.pop() ?? defecto;
    this.logger.log(`Back to ${url}`);
    return this.router.navigateByUrl(url);
  }
}
