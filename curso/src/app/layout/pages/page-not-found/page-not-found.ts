import { Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  imports: [],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css',
})
export class PageNotFound {}

// import { Component, OnInit } from '@angular/core';
// import { NotificationService } from 'src/app/common-services';

// @Component({
//   selector: 'app-page-not-found',
//   imports: [],
//   templateUrl: './page-not-found.html',
//   styleUrl: './page-not-found.css',
// })
// export class PageNotFound implements OnInit {
//   constructor(private notify: NotificationService) {}
//   ngOnInit(): void {
//     this.notify.add('Página no encontrada')
//   }
// }
