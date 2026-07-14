import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header, Footer, Notification, NotificationModal } from "./layout";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Notification, NotificationModal ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
