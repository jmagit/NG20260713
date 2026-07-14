import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, CanActivateFn, provideRouter, Router, Routes, withRouterConfig, } from '@angular/router';
import { ERROR_LEVEL, LoggerService } from '@my-library';
import { NavigationService } from './navigation';
import { RouterTestingHarness } from '@angular/router/testing';
import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-fake1',
  template: `<output [textContent]= "url">`,
})
class FakeComponent /*implements OnDestroy*/ {
  private route = inject(ActivatedRoute);
  url: string | null = this.route.snapshot.url.join('/');
  // subscription!: Subscription
  // url = signal('fake')
  // constructor(route: ActivatedRoute) {
  //   this.subscription = route.url.subscribe( { next: path => {
  //     this.url.set(path.join('/'))
  //     console.warn(path.join('/'))
  //   }})
  // }
  // ngOnDestroy(): void {
  //   this.subscription.unsubscribe()
  // }

}
@Component({
  selector: 'app-fake2',
  template: `<output [textContent]= "url">`,
})
class Fake2Component {
  private route = inject(ActivatedRoute);
  url: string | null = this.route.snapshot.url.join('/');
}

describe('NavigationService', () => {
  let service: NavigationService;
  let isLoggedIn = false;

  const isLoggedInGuard: CanActivateFn = () => {
    return isLoggedIn ? true : inject(Router).parseUrl('/redirect/login');
  };
  const routes: Routes = [
    {
      path: 'redirect', children: [
        { path: 'admin', component: FakeComponent, canActivate: [isLoggedInGuard] },
        { path: 'login', component: FakeComponent },
      ]
    },
    {
      path: 'list', children: [
        { path: 'primera', component: FakeComponent },
        { path: 'segunda', component: Fake2Component },
        { path: 'tercera', component: FakeComponent },
        { path: 'cuarta', component: Fake2Component },
        { path: 'quinta', component: FakeComponent },
        { path: 'sexta', component: Fake2Component },
      ]
    }
  ]


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggerService, { provide: ERROR_LEVEL, useValue: 10 },
        provideRouter(routes, withRouterConfig({ urlUpdateStrategy: 'eager', onSameUrlNavigation: 'reload' })), Location
      ],
    });
    service = TestBed.inject(NavigationService);
    // vi.spyOn(TestBed.inject(LoggerService), 'log').mockImplementation(() => undefined)
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.skip('go back', async () => {
    // const harness = await RouterTestingHarness.create();
    // for(const item of [...routes].reverse()) {
    //   await harness.navigateByUrl('/' + item.path, item.component!)
    //   expect(TestBed.inject(Router).url).toEqual('/' + item.path);
    // }
    const router = TestBed.inject(Router)
    const list = routes[1].children ?? []
    for (const item of [...list].reverse()) {
      await router.navigateByUrl(`/${routes[1].path}/${item.path}`)
      expect(router.url).toEqual(`/${routes[1].path}/${item.path}`);
    }

    for (let i = 1; i < list.length; i++) {
      await service.back();
      expect(router.url).toEqual(i < 5 ? `/${routes[1].path}/${list[i].path}` : '/');
    }
    await service.back();
    expect(router.url).toEqual(`/`);
  });

  it('demo', async () => {
    const harness = await RouterTestingHarness.create('/redirect/admin');
    expect(TestBed.inject(Router).url).toEqual('/redirect/login');
    isLoggedIn = true;
    await harness.navigateByUrl('/redirect/admin');
    expect(TestBed.inject(Router).url).toEqual('/redirect/admin');
    await harness.navigateByUrl('/redirect/login');
    expect(TestBed.inject(Router).url).toEqual('/redirect/login');
    await harness.navigateByUrl('/redirect/admin');
    expect(TestBed.inject(Router).url).toEqual('/redirect/admin');
    const router = TestBed.inject(Router)
    await service.back();
    await service.back();
    expect(router.url).toEqual(`/`);
  });
});
