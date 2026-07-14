import { Service, ViewContainerRef } from '@angular/core';

// Cachea el ViewContainerRef del componente app-root para permitir la creación
// dinámica de componentes. Debe registrarse en el constructor de la clase App:
//
// export class App {
//   constructor(view: RootViewContainerRefService, rootViewContainerRef: ViewContainerRef) {
//     view.RootViewContainerRef = rootViewContainerRef;
//   }

@Service()
export class RootViewContainerRefService {
  private rootViewContainerRef: ViewContainerRef | null = null;

  get RootViewContainerRef(): ViewContainerRef {
    if (!this.rootViewContainerRef) {
      throw new Error(`
        ViewContainerRef debe ser inicializado en el componente principal:
          constructor(window: WindowService, rootViewContainerRef: ViewContainerRef) {
            window.RootViewContainerRef = rootViewContainerRef;
          }`);
    }
    return this.rootViewContainerRef;
  }
  set RootViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.rootViewContainerRef = viewContainerRef;
  }
}
