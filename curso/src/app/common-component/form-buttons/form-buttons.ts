/* eslint-disable @angular-eslint/no-input-rename */
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { WindowService } from 'src/app/common-services';

@Component({
    selector: 'app-form-buttons',
    templateUrl: './form-buttons.html',
    styleUrls: ['./form-buttons.css'],
    standalone: true,
    imports: []
})
export class FormButtons {
  window = inject(WindowService)

  @Input('send-disabled') sendDisabled: boolean | null = false;
  @Input('send-text') sendText: string = 'enviar';
  @Input('cancel-text') cancelText: string = 'volver';
  @Input('delete-text') deleteText: string = 'borrar';
  @Input('delete-confirm') deleteConfirm: boolean | null = true;
  @Input('delete-confirm-text') deleteConfirmText: string = '¿Seguro?';
  @Input('delete-visible') deleteVisible: boolean = true;
  @Output() send: EventEmitter<null> = new EventEmitter<null>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() cancel: EventEmitter<null> = new EventEmitter<null>();
  @Output() delete: EventEmitter<null> = new EventEmitter<null>();

  get hasSend(): boolean { return this.send.observed; }
  get hasCancel(): boolean { return this.cancel.observed; }
  get hasDelete(): boolean { return this.delete.observed && this.deleteVisible; }

  preDelete() {
    if(this.deleteConfirm)
      this.window.confirm(this.deleteConfirmText, () => this.delete.emit())
    else
      this.delete.emit()
  }
}

