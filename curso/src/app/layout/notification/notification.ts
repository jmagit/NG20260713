import { I18nSelectPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../common-services';

@Component({
  selector: 'app-notification',
  imports: [I18nSelectPipe],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification {
  VM = inject(NotificationService);
}
