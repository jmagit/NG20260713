/* eslint-disable @angular-eslint/no-input-rename */
import { Component, output, input, computed, inject } from '@angular/core';
import { NotificationType, WindowService } from '../common-services';
import { RouterLink, UrlTree } from '@angular/router';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Link = string | readonly any[] | UrlTree | null | undefined

@Component({
    selector: 'app-list-buttons',
    template: `
    <div class="btn-group" role="group">
      @if (hasView()) {
        @if(viewLink()) {
        <button class="btn btn-info" [routerLink]="viewLink()" title="Ver"><i class="fas fa-eye"></i></button>
        } @else {
        <button class="btn btn-info" (click)="view.emit(null)" title="Ver"><i class="fas fa-eye"></i></button>
        }
      }
      @if (hasEdit()) {
        @if(editLink()) {
        <button class="btn btn-success" [routerLink]="editLink()" title="Editar"><i class="fas fa-pen"></i></button>
        } @else {
        <button class="btn btn-success" (click)="edit.emit(null)" title="Editar"><i class="fas fa-pen"></i></button>
        }
      }
      @if (hasDelete()) {
        @if(deleteLink()) {
        <button class="btn btn-danger" [routerLink]="deleteLink()" title="Borrar"><i class="fas fa-trash-alt"></i></button>
        } @else {
        <button class="btn btn-danger" (click)="confirmDelete()" title="Borrar"><i class="far fa-trash-alt"></i></button>
        }
      }
    </div>
  `,
    standalone: true,
    imports: [ RouterLink ]
})
export class ListButtons {
  canView = input(true, { alias: 'can-view'})
  canEdit = input(true, { alias: 'can-edit'})
  canDelete = input(true, { alias: 'can-delete'})
  confirmDeleteMsg = input('Una vez borrado no se podrá recuperar. ¿Continuo?', { alias: 'confirm-delete-message'})
  view = output<null>()
  edit = output<null>()
  delete = output<null>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasView = computed(() => this.canView() && (this.viewLink() !== '' ||  (((this.view as any)?.listeners?.length ?? 0) > 0)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasEdit = computed(() => this.canEdit() && (this.editLink() !== '' ||  (((this.edit as any)?.listeners?.length ?? 0) > 0)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasDelete = computed(() => this.canDelete() && (this.deleteLink() !== '' || (((this.delete as any)?.listeners?.length ?? 0) > 0)))

  viewLink = input<Link>(null, { alias: 'view-link'})
  editLink = input<Link>(null, { alias: 'edit-link'})
  deleteLink = input<Link>(null, { alias: 'delete-link'})

  private window = inject(WindowService);

  confirmDelete() {
    if(this.confirmDeleteMsg())
      this.window.confirm(this.confirmDeleteMsg(), () => this.delete.emit(null), NotificationType.error, "Confirmación")
  }

}
