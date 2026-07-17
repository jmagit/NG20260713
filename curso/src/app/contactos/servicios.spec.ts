/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { inputBinding, NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideLocationMocks } from '@angular/common/testing';

import { environment } from 'src/environments/environment';
import { NavigationService, NotificationService } from '../common-services';
import { LoggerService } from '@my-library';
import { DAOServiceMock } from '../core';
import { Contacto, ContactoModel, ContactosDAOService, ContactosViewModelService, init_value } from './servicios';
import { ContactosList, ContactosAdd, ContactosEdit, ContactosView } from './componentes';
import { routes } from './contactos-module';

describe('Modulo Contactos', () => {
  const apiURL = environment.apiURL + 'contactos'
  const dataMock = [
    { "id": 1, "tratamiento": "Sra.", "nombre": "Marline", "apellidos": "Lockton Jerrans", "telefono": "846 054 444", "email": "mjerrans0@de.vu", "sexo": "M", "nacimiento": "1973-07-09", "avatar": "https://randomuser.me/api/portraits/women/1.jpg", "conflictivo": true },
    { "id": 2, "tratamiento": "Sr.", "nombre": "Beale", "apellidos": "Knibb Koppe", "telefono": "093 804 977", "email": "bkoppe0@apache.org", "sexo": "H", "nacimiento": "1995-11-22", "avatar": "https://randomuser.me/api/portraits/men/1.jpg", "conflictivo": false },
    { "id": 3, "tratamiento": "Srta.", "nombre": "Gwenora", "apellidos": "Forrestor Fitzackerley", "telefono": "853 134 343", "email": "gfitzackerley1@opensource.org", "sexo": "M", "nacimiento": "1968-06-12", "avatar": "https://randomuser.me/api/portraits/women/2.jpg", "conflictivo": false },
    { "id": 4, "tratamiento": "Sr.", "nombre": "Umberto", "apellidos": "Langforth Spenclay", "telefono": "855 032 596", "email": "uspenclay1@mlb.com", "sexo": "H", "nacimiento": "2000-05-15", "avatar": "https://randomuser.me/api/portraits/men/2.jpg", "conflictivo": false }
  ];
  const dataAddMock: ContactoModel = { id: 0, nombre: "Pepito", apellidos: "Grillo" }
  const dataEditMock: ContactoModel = { id: 1, nombre: "Pepito", apellidos: "Grillo" }
  const dataBadMock: Record<string, any> = { id: -1 }
  const empty = init_value

  describe('DAOService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [ContactosDAOService, provideHttpClient(), provideHttpClientTesting()],
      });
    });

    it('query', inject([ContactosDAOService, HttpTestingController], (dao: ContactosDAOService, httpMock: HttpTestingController) => {
      dao.query().subscribe({
        next: data => {
          expect(data.length).toEqual(dataMock.length);
        },
        error: () => { assert.fail('has executed "error" callback'); }
      });
      const req = httpMock.expectOne(apiURL);
      expect(req.request.method).toEqual('GET');
      req.flush([...dataMock]);
      httpMock.verify();
    }));

    it('get', inject([ContactosDAOService, HttpTestingController], (dao: ContactosDAOService, httpMock: HttpTestingController) => {
      dao.get(1).subscribe({
        next: data => {
          expect(data).toEqual(dataMock[0]);
        },
        error: () => { assert.fail('has executed "error" callback'); }
      });
      const req = httpMock.expectOne(`${apiURL}/1`);
      expect(req.request.method).toEqual('GET');
      req.flush({ ...dataMock[0] });
      httpMock.verify();
    }));

    it('add', inject([ContactosDAOService, HttpTestingController], (dao: ContactosDAOService, httpMock: HttpTestingController) => {
      const item = { ...dataAddMock } as Contacto;
      dao.add(item).subscribe();
      const req = httpMock.expectOne(`${apiURL}`);
      expect(req.request.method).toEqual('POST');
      for (const key in dataEditMock) {
        if (Object.prototype.hasOwnProperty.call(dataAddMock, key)) {
          expect(req.request.body[key]).toEqual(dataAddMock[key]);
        }
      }
      httpMock.verify();
    }));

    it('change', inject([ContactosDAOService, HttpTestingController], (dao: ContactosDAOService, httpMock: HttpTestingController) => {
      const item = { ...dataEditMock } as Contacto;
      dao.change(1, item).subscribe();
      const req = httpMock.expectOne(`${apiURL}/1`);
      expect(req.request.method).toEqual('PUT');
      for (const key in dataEditMock) {
        if (Object.prototype.hasOwnProperty.call(dataEditMock, key)) {
          expect(req.request.body[key]).toEqual(dataEditMock[key]);
        }
      }
      httpMock.verify();
    }));

    it('delete', inject([ContactosDAOService, HttpTestingController], (dao: ContactosDAOService, httpMock: HttpTestingController) => {
      dao.remove(1).subscribe();
      const req = httpMock.expectOne(`${apiURL}/1`);
      expect(req.request.method).toEqual('DELETE');
      httpMock.verify();
    }));

  });
  describe('ViewModelService', () => {
    let service: ContactosViewModelService;
    let dao: ContactosDAOService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [NotificationService, LoggerService,
          provideHttpClient(), provideHttpClientTesting(),
          provideRouter([]), provideLocationMocks(),
          { provide: ContactosDAOService, useFactory: () => new DAOServiceMock<Contacto, number>([...dataMock]) }
        ],
      });
      service = TestBed.inject(ContactosViewModelService);
      dao = TestBed.inject(ContactosDAOService);
      vi.spyOn(console, 'log').mockImplementation(() => undefined)
      vi.spyOn(console, 'error').mockImplementation(() => undefined)
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('mode', () => {
      describe('list', () => {
        it('OK', () => {
          service.list()
          // TestBed.tick()
          expect(service.Listado().length, 'Verify Listado length').toBe(dataMock.length)
          expect(service.Modo(), 'Verify Modo is ').toBe('list')
        })
      })

      describe('add', () => {
        it('OK', () => {
          service.add()
          expect(service.Elemento(), 'Verify Elemento').toEqual(empty)
          expect(service.Modo(), 'Verify Modo is add').toBe('add')
        })
      })

      describe('edit', () => {
        it(' OK', () => {
          service.edit(3)
          // TestBed.tick()

          expect(service.Elemento(), 'Verify Elemento').toEqual(dataMock[2])
          expect(service.Modo(), 'Verify Modo is edit').toBe('edit')
        })

        it('KO', () => {
          const notify = TestBed.inject(NotificationService);
          vi.spyOn(notify, 'add')

          service.edit(dataMock.length + 1)
          // TestBed.tick()

          expect(notify.add, 'notify error').toHaveBeenCalled()
        })
      })

      describe('view', () => {
        it(' OK', () => {
          service.view(1)
          // TestBed.tick()

          expect(service.Elemento(), 'Verify Elemento').toEqual(dataMock[0])
          expect(service.Modo(), 'Verify Modo is view').toBe('view')
        })

        it('KO', () => {
          const notify = TestBed.inject(NotificationService);
          vi.spyOn(notify, 'add')

          service.view(dataMock.length + 1)
          // TestBed.tick()

          expect(notify.add, 'notify error').toHaveBeenCalled()
        })
      })

      describe.skip('delete', () => {
        it('accept confirm', () => {
          vi.spyOn(window, 'confirm').mockReturnValue(true)
          service.delete(3)
          // TestBed.tick()
          expect(service.Listado().length, 'Verify Listado length').toBe(dataMock.length - 1)
          expect(service.Modo(), 'Verify Modo is list').toBe('list')
        })

        it.skip('reject confirm', () => {
          vi.spyOn(window, 'confirm').mockReturnValue(false)
          service.delete(+ 1)
          // TestBed.tick()
          expect((dao as Record<string, any>)['listado'].length, 'Verify Listado length').toBe(dataMock.length)
        })

        it('KO', () => {
          vi.spyOn(window, 'confirm').mockReturnValue(true)
          const notify = TestBed.inject(NotificationService);
          vi.spyOn(notify, 'add')

          service.delete(dataMock.length + 1)
          // TestBed.tick()

          expect(notify.add, 'notify error').toHaveBeenCalled()
        })
      })
    })

    it('cancel', () => {
      const navigation = TestBed.inject(NavigationService);
      vi.spyOn(navigation, 'back')
      service.edit(2)
      // TestBed.tick()
      expect(service.Elemento(), 'Verifica fase de preparación').toBeDefined()
      service.cancel()
      expect(service.Elemento(), 'Verify Elemento').toEqual(empty)
      expect(navigation.back).toHaveBeenCalled()
    })

    describe('send', () => {
      describe('add', () => {
        it('OK', () => {
          vi.spyOn(service, 'cancel')
          service.add()
          // TestBed.tick()
          expect(service.Elemento()).toBeDefined()
          const ele = { ...empty } as any;
          for (const key in dataAddMock) {
            service.Elemento()![key] = dataAddMock[key];
            ele[key] = dataAddMock[key];
          }
          service.send()
          // TestBed.tick()
          const listado = (dao as Record<string, any>)['listado']
          expect(listado.length).toBe(dataMock.length + 1)
          expect({ ...listado[listado.length - 1] }).toEqual(ele)
          expect(service.cancel, 'Verify init ViewModel').toHaveBeenCalled()
        })
        it('KO', () => {
          const notify = TestBed.inject(NotificationService);
          vi.spyOn(notify, 'add')
          service.add()
          // TestBed.tick()
          expect(service.Elemento()).toBeDefined()
          for (const key in dataBadMock) {
            service.Elemento()![key] = dataBadMock[key];
          }
          service.send()
          // TestBed.tick()
          expect(notify.add, 'notify error').toHaveBeenCalled()
        })
      })

      describe('edit', () => {
        it('OK', () => {
          vi.spyOn(service, 'cancel')
          service.edit(1)
          // TestBed.tick()
          expect(service.Elemento()).toBeDefined()
          let editado = empty
          service.Elemento.update(value => {
            editado = { ...value, ...dataEditMock }
            return editado
          });
          TestBed.tick()
          // for (const key in dataEditMock) {
          //   service.Elemento()![key] = dataEditMock[key];
          // }
          service.send()
          // TestBed.tick()
          const listado = (dao as Record<string, any>)['listado']
          expect(listado.length, 'Verify Listado length').toBe(dataMock.length)
          expect(listado[0], 'Verify Elemento').toEqual(editado)
          expect(service.cancel, 'Verify init ViewModel').toHaveBeenCalled()
        })
        it('KO', () => {
          const notify = TestBed.inject(NotificationService);
          vi.spyOn(notify, 'add')
          service.edit(1)
          // TestBed.tick()
          expect(service.Elemento()).toBeDefined()
          for (const key in dataBadMock) {
            service.Elemento()![key] = dataBadMock[key];
          }
          (dao as Record<string, any>)['listado'].splice(0)
          service.send()
          // TestBed.tick()
          expect(notify.add, 'notify error').toHaveBeenCalled()
        })
      })
    })

  });
  describe('Componentes', () => {
    [ContactosList, ContactosAdd, ContactosEdit, ContactosView,].forEach(componente => {
      describe(componente.name, () => {
        let component: any;
        let fixture: ComponentFixture<any>;

        beforeEach(async () => {
          await TestBed.configureTestingModule({
            providers: [NotificationService, LoggerService, ContactosViewModelService,
              provideHttpClient(), provideHttpClientTesting(),
              provideRouter(routes), provideLocationMocks()],
            imports: [FormsModule, componente],
            schemas: [NO_ERRORS_SCHEMA]
          }).compileComponents();
        });

        beforeEach(() => {
          const vm = TestBed.inject(ContactosViewModelService)
          vm.add()
          const option = componente === ContactosView ? { bindings: [ inputBinding('id', () => 1)], } : {}
          fixture = TestBed.createComponent(componente as Type<any>, option);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });

        it('should create', () => {
          expect(component).toBeTruthy();
        });
      });

    })
  })
});

