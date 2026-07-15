import { ApplicationConfig, inject, LOCALE_ID, provideBrowserGlobalErrorListeners, provideEnvironmentInitializer } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
// Cargar idioma
import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
registerLocaleData(localeEs, 'es', localeEsExtra);

import { routes } from './app.routes';
import { ERROR_LEVEL, /*LoggerService*/ } from '@my-library';
import { environment } from 'src/environments/environment';
import { NavigationService } from './common-services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideEnvironmentInitializer(() => inject(NavigationService)),
    // LoggerService,
    { provide: ERROR_LEVEL, useValue: environment.ERROR_LEVEL },
    { provide: LOCALE_ID, useValue: 'es-ES '},
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: 'dd/MMM/yy'},
  ]
};
