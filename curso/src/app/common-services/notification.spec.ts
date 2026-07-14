import { TestBed } from '@angular/core/testing';
import { LoggerService } from '@my-library';
import { NotificationType } from '.';

import { NotificationService } from './notification';
import { environment } from 'src/environments/environment';

describe('NotificationService', () => {
  const message = 'Notificación al usuario'
  const message2 = 'Notificación al usuario (2)'
  let service: NotificationService;
  let log: LoggerService;

  describe('Aislada', () => {
    beforeEach(() => {
      log = new LoggerService(0);
      service = new NotificationService(log);
      vi.spyOn(log, 'error');
    });

    describe('OK', () => {
      it('add message: error', () => new Promise(done => {
        service.Notificacion.subscribe({
          next: data => { expect(data.Message).toBe(message); done(undefined); },
          error: () => expect.fail()
        });
        service.add(message)
        expect(service.HayNotificaciones()).toBeTruthy();
        expect(service.Listado().length).toBe(1);
        expect(service.Listado()[0].Id).toBe(1);
        expect(service.Listado()[0].Message).toBe(message);
        expect(service.Listado()[0].Type).toBe(NotificationType.error);
        if (!environment.production) {
          expect(log.error).toHaveBeenCalled();
          expect(log.error).toHaveBeenCalledWith(`NOTIFICATION: ${message}`)
        }
        done(undefined)
      }));

      it('add message: warn', () => new Promise(done => {
        service.Notificacion.subscribe({
          next: data => { expect(data.Message).toBe(message); done(undefined); },
          error: () => expect.fail()
        });
        service.add(message, NotificationType.warn)
        expect(service.HayNotificaciones()).toBeTruthy();
        expect(service.Listado().length).toBe(1);
        expect(service.Listado()[0].Id).toBe(1);
        expect(service.Listado()[0].Message).toBe(message);
        expect(service.Listado()[0].Type).toBe(NotificationType.warn);
        expect(log.error).not.toHaveBeenCalled();
        done(undefined);
      }));

      it('remove message', () => {
        service.add(message)
        service.add(message2)
        expect(service.HayNotificaciones()).toBeTruthy();
        expect(service.Listado().length).toBe(2);
        service.remove(0)
        expect(service.Listado().length).toBe(1);
        expect(service.Listado()[0].Id).toBe(2);
        service.remove(0)
        expect(service.HayNotificaciones()).toBeFalsy();
      });

      it('clear messages', () => {
        service.add(message)
        service.add(message2)
        expect(service.HayNotificaciones()).toBeTruthy();
        expect(service.Listado().length).toBe(2);
        service.clear()
        expect(service.HayNotificaciones()).toBeFalsy();
      });

    })
    describe('KO', () => {
      it('add message: sin mensaje', () => {
        service.Notificacion.subscribe({
          next: () => expect.fail('No debería ser llamada'),
        });
        service.add('')
        expect(log.error).toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('Falta el mensaje de notificación.')
      });
      it('remove: fuera de rango', () => {
        service.remove(1)
        expect(log.error).toHaveBeenCalled();
        expect(log.error).toHaveBeenCalledWith('Index out of range.')
      });

    })
  })

  describe('Integración', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [LoggerService],
      });
      service = TestBed.inject(NotificationService);
      log = TestBed.inject(LoggerService);
      vi.spyOn(log, 'error');
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  })
});
