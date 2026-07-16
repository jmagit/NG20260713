import { Component, inject, Service, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ErrorMessagePipe } from '@my-library';
import { NotificationService } from 'src/app/common-services';

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
class PersonaViewModelService {
  private readonly notify = inject(NotificationService)

  Modo = signal<Modo>('add')
  Elemento = signal<Persona>({...INIT_VALUE})

  add() {
    this.Elemento.set({...INIT_VALUE})
    this.Modo.set('add')
  }

  edit(key: number) {
    this.Elemento.set({id: key, nombre: 'Pepito', apellidos: 'Grillo', edad: 99, correo: 'pgrillo@example.com', nif: '4g'})
    this.Modo.set('edit')
  }

  cancel() {
    this.Elemento.set({...INIT_VALUE})
    this.Modo.set('add')
  }

  send() {
    switch(this.Modo()) {
      case 'add':
        this.notify.add(`POST ${JSON.stringify(this.Elemento())}`)
        this.cancel()
        break;
      case 'edit':
        this.notify.add(`PUT ${JSON.stringify(this.Elemento())}`)
        this.cancel()
        break;
    }
  }
}

@Component({
  selector: 'app-formulario',
  imports: [ FormsModule, ErrorMessagePipe ],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  vm = inject(PersonaViewModelService)
}
