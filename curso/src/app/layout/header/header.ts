import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { generaMenu, Option } from 'src/app/app.routes';
import { AuthService } from 'src/app/security/servicios';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
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
