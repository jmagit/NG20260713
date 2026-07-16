import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, ValidatorFn, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User, RegisterUserDAO, LoginService } from '../servicios';
import { ErrorMessagePipe, LoggerService } from '@my-library';
import { NotificationService, NotificationType } from 'src/app/common-services';

@Component({
    selector: 'app-register-user-reactive',
    templateUrl: './register-user-reactive.html',
    styleUrls: ['./register-user-reactive.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule]
})
export class RegisterUserReactive implements OnInit {
  public miForm: FormGroup = new FormGroup({});
  private model: User = new User();
  private pipe = new ErrorMessagePipe();

  constructor(private dao: RegisterUserDAO, private notify: NotificationService,
    private out: LoggerService, private router: Router, private login: LoginService) { }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => control?.get('passwordValue')?.value === control?.get('passwordConfirm')?.value
      ? null : { 'mismatch': 'Son distintos' };
  }

  ngOnInit() {
    // const fa = new FormArray([]);
    // this.model.roles.forEach(r => fa.push(
    //   new FormGroup({ role: new FormControl(r.role , Validators.required) })
    // ));
    this.miForm = new FormGroup({
      idUsuario: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.email]),
      nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]),
      password: new FormGroup({
        passwordValue: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/)]),
        passwordConfirm: new FormControl('', Validators.required),
      }, this.passwordMatchValidator()),
      roles: new FormArray([])
    });
    // for (const name in this.miForm.controls) {
    //   if (this.miForm.controls[name] instanceof FormControl) {
    //     this.miForm.controls[name].valueChanges.subscribe(
    //       data => { this.formatErrorMessage(this.miForm.controls[name] as FormControl); }
    //     );
    //     // this.formatErrorMessage(this.miForm.controls[name] as FormControl);
    //     this.miForm.controls[name].setValue(this.miForm.controls[name].value)
    //   }
    // }
  }
  public getErrorMessage(name: string): string {
    const control = this.miForm.get(name)
    let msg = '';
    if (control)
      msg = this.pipe.transform(control.errors)
    return msg;
  }
  private formatErrorMessage(control: FormControl): void {
    control.setErrors(Object.assign({}, control.errors, { 'customMsg': this.pipe.transform(control.errors) }));
  }
  addRole(): void {
    (this.miForm.get('roles') as FormArray).push(
      new FormGroup({ role: new FormControl('Usuarios', Validators.required) })
    );
  }
  deleteRole(ind: number): void {
    (this.miForm.get('roles') as FormArray).removeAt(ind);
  }
  send(): void {
    const data = this.miForm.value;
    this.model = ({
      idUsuario: data.idUsuario,
      password: data.password.passwordValue,
      nombre: data.nombre,
      roles: data.roles
    } as User);
    this.dao.add(this.model).subscribe({
      next: () => {
        this.login.login(data.idUsuario, data.password.passwordValue).subscribe({
          next: datos => {
            if (datos) {
              this.notify.add('Usuario registrado', NotificationType.log);
              this.router.navigateByUrl('/');
            } else {
              this.notify.add('Error en el registro.');
            }
          },
          error: err => { this.notify.add(err.error.detail || err.message); }
        });
      },
      error: err => { this.notify.add(err.error.detail || err.message); }
    });
  }
}
