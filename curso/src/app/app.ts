/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, inject, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header, Footer, Notification, NotificationModal, AjaxWait } from "./layout";
import { RootViewContainerRefService } from './common-services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, /*Notification,*/ NotificationModal, AjaxWait],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() {
    const view = inject(RootViewContainerRefService)
    view.RootViewContainerRef = inject(ViewContainerRef);
  }
}
