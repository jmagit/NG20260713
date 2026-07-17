import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { generaMenu, Option } from 'src/app/app.routes';
import { Login, AuthService } from 'src/app/security';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Login],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  auth = inject(AuthService)
  menu = signal<Option[]>([])

  constructor() {
    this.actualizaMenu()
    effect(() => {
      this.auth.isAuthenticated()
      this.actualizaMenu()
    })
  }

  actualizaMenu() {
    this.menu.set(generaMenu(this.auth))
  }
}
