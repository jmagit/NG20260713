import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Configuracion } from './configuracion';
import { provideRouter } from '@angular/router';

describe('Configuracion', () => {
  let component: Configuracion;
  let fixture: ComponentFixture<Configuracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Configuracion],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Configuracion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
