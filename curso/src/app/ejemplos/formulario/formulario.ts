import { HttpContext, httpResource } from '@angular/common/http';
import { Component, inject, Service, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ErrorMessagePipe, NIFNIEValidator, NotblankValidator, TypeValidator, UppercaseValidator } from '@my-library';
import { NotificationService } from 'src/app/common-services';
import { RESTDAOService } from 'src/app/core';
import { AUTH_REQUIRED } from 'src/app/security/servicios';
import { environment } from 'src/environments/environment';

type Modo = 'add' | 'edit'

interface Persona {
  id: number
  nombre: string
  apellidos?: string
  edad?: number
  correo?: string
  nif?: string
}

const INIT_VALUE: Persona = {
  id: 0,
  nombre: ''
}

@Service()
class PersonasDAOService extends RESTDAOService<Persona, number> {
  constructor() {
    super('personas', { context: new HttpContext().set(AUTH_REQUIRED, true) })
  }
}

@Service()
class PersonaViewModelService {
  private readonly notify = inject(NotificationService)
  private readonly dao = inject(PersonasDAOService)

  Modo = signal<Modo>('add')
  Elemento = signal<Persona>({...INIT_VALUE})

  add() {
    this.Elemento.set({...INIT_VALUE})
    this.Modo.set('add')
  }

  edit(key: number) {
    this.dao.get(key).subscribe({
      next: data => {
        this.Elemento.set(data)
        this.Modo.set('edit')
      },
      error: err => this.notify.add(err.message)
    })
    // this.Elemento.set({id: key, nombre: 'Pepito', apellidos: 'Grillo', edad: 99, correo: 'pgrillo@example.com', nif: '4g'})
    // this.Modo.set('edit')
  }

  cancel() {
    this.Elemento.set({...INIT_VALUE})
    this.Modo.set('add')
  }

  send() {
    switch(this.Modo()) {
      case 'add':
        this.dao.add(this.Elemento()).subscribe({
          next: () => this.cancel(),
          error: err => this.notify.add(err.message),
        })
        // this.notify.add(`POST ${JSON.stringify(this.Elemento())}`)
        // this.cancel()
        break;
      case 'edit':
        this.dao.change(this.Elemento().id, this.Elemento()).subscribe({
          next: () => this.cancel(),
          error: err => this.notify.add(err.message),
        })
        // this.notify.add(`PUT ${JSON.stringify(this.Elemento())}`)
        // this.cancel()
        break;
    }
  }
}

@Component({
  selector: 'app-formulario',
  imports: [ FormsModule, ErrorMessagePipe, NIFNIEValidator, UppercaseValidator, NotblankValidator, TypeValidator ],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  vm = inject(PersonaViewModelService)
  id = signal(1)
  // readonly recurso = httpResource(() => `${environment.apiURL}peliculas/${this.id()}`)
  readonly recurso = httpResource(() => ({ url: `${environment.apiURL}libros/${this.id()}`, method: 'GET', context: new HttpContext().set(AUTH_REQUIRED, true)}))

}
