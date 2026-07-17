import { DatePipe } from '@angular/common';
import { Component, OnChanges, OnDestroy, inject, input, SimpleChanges, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router, ParamMap } from '@angular/router';
import { TypeValidator, ErrorMessagePipe } from '@my-library';
import { Subscription } from 'rxjs';
import { FormButtons, Paginator } from '../common-component';
import { ContactosViewModelService } from './servicios';
import { NotificationType, WindowService } from '../common-services';

@Component({
    selector: 'app-contactos-list',
    templateUrl: './tmpl-list.html',
    styleUrls: ['./componentes.css'],
    imports: [RouterLink, Paginator]
})
export class ContactosList implements OnChanges, OnDestroy {
  readonly VM = inject(ContactosViewModelService);
  readonly page = input(0);

  ngOnChanges(_changes: SimpleChanges): void {
    // this.VM.list()
    this.VM.load(this.page())
  }

  ngOnDestroy(): void { this.VM.clear(); }

  readonly window = inject(WindowService);

  delete(key: number) {
    this.window.confirm('Una vez borrado no podrás recuperarlo. ¿Quieres continuar?', () => this.VM.delete(key), NotificationType.error)
  }
}

@Component({
    selector: 'app-contactos-add',
    templateUrl: './tmpl-form.html',
    styleUrls: ['./componentes.css'],
    imports: [FormsModule, FormButtons, TypeValidator, ErrorMessagePipe]
})
export class ContactosAdd implements OnInit {
  readonly VM = inject(ContactosViewModelService);

  ngOnInit(): void {
    this.VM.add();
  }
}

@Component({
    selector: 'app-contactos-edit',
    templateUrl: './tmpl-form.html',
    styleUrls: ['./componentes.css'],
    imports: [FormsModule, FormButtons, TypeValidator, ErrorMessagePipe]
})
export class ContactosEdit implements OnInit, OnDestroy {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  readonly VM = inject(ContactosViewModelService);

  private obs$?: Subscription;

  ngOnInit(): void {
    this.obs$ = this.route.paramMap.subscribe(
      (params: ParamMap) => {
        const id = parseInt(params?.get('id') ?? '');
        if (id) {
          this.VM.edit(id);
        } else {
          this.router.navigate(['/404.html']);
        }
      });
  }
  ngOnDestroy(): void {
    this.obs$!.unsubscribe();
  }
}

@Component({
    selector: 'app-contactos-view',
    templateUrl: './tmpl-view.html',
    styleUrls: ['./componentes.css'],
    imports: [DatePipe]
})
export class ContactosView {
  protected readonly router = inject(Router);
  readonly VM = inject(ContactosViewModelService);
  readonly id = input.required<string>();

  constructor() {
    effect(() => {
      const id = +this.id();
      if (id) {
        this.VM.view(+id);
      } else {
        this.router.navigate(['/404.html']);
      }
    });
  }
}
