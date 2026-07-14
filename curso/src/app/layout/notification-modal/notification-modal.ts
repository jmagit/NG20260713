import { Component, inject } from '@angular/core';
import { NotificationService } from '../../common-services';

@Component({
  selector: 'app-notification-modal',
  imports: [],
  templateUrl: './notification-modal.html',
  styleUrl: './notification-modal.css',
})
export class NotificationModal {
  VM = inject(NotificationService);
}
