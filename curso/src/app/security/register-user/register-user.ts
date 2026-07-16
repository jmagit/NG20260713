import { Component, computed, inject, signal } from '@angular/core';
import {
  applyEach,
  email,
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  required,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ErrorToTextPipe, LoggerService } from '@my-library';
import { NotificationService, NotificationType } from 'src/app/common-services';
import { RegisterUserDAO, LoginService, Role, User } from '../servicios';

const ROLES = ['Usuarios', 'Empleados', 'Administradores'];

function RoleSchema(item: SchemaPathTree<Role>) {
  required(item.role, { message: 'Es obligatorio' });
}

interface form_model {
  [index: string]: unknown;
  idUsuario: string;
  nombre: string;
  password: {
    passwordValue: string;
    passwordConfirm: string;
  };
  roles: Role[];
}

const form_empty: form_model = {
  idUsuario: '',
  nombre: '',
  password: {
    passwordValue: '',
    passwordConfirm: '',
  },
  roles: [],
};

@Component({
  selector: 'app-register-user',
  imports: [FormField, ErrorToTextPipe],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {
  private readonly dao = inject(RegisterUserDAO);
  private readonly notify = inject(NotificationService);
  private readonly out = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly login = inject(LoginService);

  private readonly formModel = signal({ ...form_empty });
  fieldsTree = form(this.formModel, (sch) => {
    required(sch.idUsuario);
    email(sch.idUsuario);
    required(sch.nombre);
    minLength(sch.nombre, 2);
    maxLength(sch.nombre, 25);
    required(sch.password.passwordValue);
    pattern(sch.password.passwordValue, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/, {
      message:
        'Debe contener al menos 8 caracteres con letras mayúsculas, minúsculas, números y símbolos',
    });
    required(sch.password.passwordConfirm, { message: 'Debes confirmar la contraseña' });
    validate(sch.password.passwordConfirm, ({ value, valueOf }) => {
      return value() === valueOf(sch.password.passwordValue)
        ? null
        : { kind: 'passwordMismatch', message: 'No coincide con la contraseña' };
    });
    applyEach(sch.roles, RoleSchema);
  }, {
    // submission: {
    //   action: async (field) => {
    //       // const result = await saveContact(field().value());
    //       // if (result.ok) return;
    //       // return {kind: 'serverError', message: 'Failed to submit form'};
    //     },
    // }
  });
  listado = computed(() =>
    ROLES.filter((item) => this.formModel().roles.findIndex((r) => item === r.role) < 0),
  );

  addRole(role: string) {
    // this.formModel.update((value) => ({ ...value, roles: [...value.roles, { role }] }));
    this.fieldsTree.roles().value.update(value => [...value, { role }]);
  }
  deleteRole(role: string) {
    // this.formModel.update((value) => ({...value, roles: value.roles.filter((item) => item.role !== role), }));
    this.fieldsTree.roles().value.update(value => value.filter((item) => item.role !== role));
  }
  send() {
    const data = this.formModel();
    const model = {
      idUsuario: data.idUsuario,
      password: data.password.passwordValue,
      nombre: data.nombre,
      roles: data.roles,
    } as User;
    this.dao.add(model).subscribe({
      next: async (resp) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((resp as any).confirmGetUri)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await fetch((resp as any).confirmGetUri);
        this.login.login(data.idUsuario, data.password.passwordValue).subscribe({
          next: (datos) => {
            if (datos) {
              this.notify.add('Usuario registrado', NotificationType.log);
              this.router.navigateByUrl('/');
            } else {
              this.notify.add('Error en el registro.');
            }
          },
          error: (err) => {
            this.notify.add(err.error.detail || err.message);
          },
        });
      },
      error: (err) => {
        this.notify.add(err.error.detail || err.message);
      },
    });
  }
}
