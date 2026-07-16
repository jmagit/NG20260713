import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LOGIN_FORM_CLOSE_EVENT, LOGIN_FORM_OPEN_EVENT, LoginService } from '../servicios';
import { EventBusService, NotificationService } from '../../common-services';

abstract class BaseComponent {
  public loginSrv = inject(LoginService)
  private notify = inject(NotificationService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  protected eventBus = inject(EventBusService)

  txtUsuario = signal(environment?.defaultUsername ?? '');
  txtPassword = signal(environment?.defaultPassword ?? '');

  logInOut() {
    if (this.loginSrv.isAuthenticated()) {
      this.loginSrv.logout();
      this.reloadPage()
    } else {
      this.loginSrv.login(this.txtUsuario(), this.txtPassword()).subscribe({
        next: data => {
          if (data) {
            if (this.route.snapshot.queryParams['returnUrl']) {
              this.router.navigateByUrl(this.route.snapshot.queryParams['returnUrl']);
              return
            }
            this.reloadPage()
          } else {
            this.notificaError('Usuario o contraseña invalida.')
          }
        },
        error: err => { this.notificaError(err.message); }
      });
    }
  }

  protected notificaError(error: string) {
    this.notify.add(error);
  }

  registrar() {
    this.router.navigateByUrl('/registro');
  }

  reloadPage(): void {
    this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' })
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [FormsModule]
})
export class Login extends BaseComponent implements OnDestroy {
  private login$: Subscription;
  private logout$: Subscription;
  visible = signal(true)
  constructor() {
    super()
    this.login$ = this.eventBus.on(LOGIN_FORM_OPEN_EVENT, () => {
      this.visible.set(false)
    })
    this.logout$ = this.eventBus.on(LOGIN_FORM_CLOSE_EVENT, () => {
      this.visible.set(true)
    })
  }
  ngOnDestroy(): void {
    this.login$.unsubscribe()
    this.logout$.unsubscribe()
  }
}

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [FormsModule]
})
export class LoginForm extends BaseComponent implements OnInit, OnDestroy {
  errorMessage = '';

  constructor() {
    super()
  }

  ngOnInit(): void {
    this.eventBus.emit(LOGIN_FORM_OPEN_EVENT);
  }

  ngOnDestroy(): void {
    this.eventBus.emit(LOGIN_FORM_CLOSE_EVENT);
  }

  protected override notificaError(error: string) {
    this.errorMessage = error ?? 'Usuario o contraseña invalida.';
  }
}
