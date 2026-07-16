import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterUserReactive } from './register-user-reactive';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { LoggerService } from '@my-library';
import { provideHttpClient } from '@angular/common/http';

describe('RegisterUserReactive', () => {
  let component: RegisterUserReactive;
  let fixture: ComponentFixture<RegisterUserReactive>;

  beforeEach(async () => {
    const routerSpy = {
      navigateByUrl: vi.fn().mockName('Router.navigateByUrl'),
    };
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        LoggerService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
      imports: [RegisterUserReactive],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserReactive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
