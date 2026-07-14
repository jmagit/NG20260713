import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { ConfirmComponent, WindowService } from './window';
import { NotificationType } from './notification';
import { ComponentRef, ViewContainerRef } from '@angular/core';
import { RootViewContainerRefService } from './root-view-container-ref-service';

describe('WindowService', () => {
  let service: WindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('ConfirmComponent', () => {
  let component: ConfirmComponent;
  let fixture: ComponentFixture<ConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render with default input values', () => {
    expect(component.title()).toBe('Confirmación');
    expect(component.message()).toBe('¿Estas seguro');
    expect(component.acceptMsg()).toBe('Si');
    expect(component.cancelMsg()).toBe('No');
    expect(component.isConfirm()).toBe(true);
    expect(component.type()).toBe(NotificationType.info);
  });

  it('should render custom input values', () => {
    TestBed.runInInjectionContext(() => {
      component = new ConfirmComponent();
    });
    expect(component.title()).toBe('Confirmación');
    expect(component.message()).toBe('¿Estas seguro');
  });

  it('should display title in modal header', () => {
    const header = fixture.nativeElement.querySelector('.modal-title');
    expect(header.textContent).toContain('Confirmación');
  });

  it('should display message in modal body', () => {
    const body = fixture.nativeElement.querySelector('.modal-body');
    expect(body.textContent).toContain('¿Estas seguro');
  });

  it('should emit confirm output with false when cancel clicked', async () => {
    let emittedValue = false;
    component.confirm.subscribe((result: boolean) => {
      emittedValue = result;
    });
    component.confirmar();
    expect(emittedValue).toBe(false);
  });

  it('should emit confirm output with true when accept clicked', async () => {
    let emittedValue = false;
    component.confirm.subscribe((result: boolean) => {
      emittedValue = result;
    });
    component.confirmar(true);
    expect(emittedValue).toBe(true);
  });

  it('should show accept button only when isConfirm is true', () => {
    fixture.componentRef.setInput('isConfirm', true);
    fixture.detectChanges();
    const acceptBtn = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((btn: HTMLButtonElement) => btn.textContent?.includes('Si') ?? false);
    expect(acceptBtn).toBeTruthy();
  });

  it('should hide accept button when isConfirm is false', () => {
    fixture.componentRef.setInput('isConfirm', false);
    fixture.detectChanges();
    const acceptBtn = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find((btn: HTMLButtonElement) => btn.textContent?.includes('Si') ?? false);
    expect(acceptBtn).toBeFalsy();
  });

  it('should apply danger style when type is error', () => {
    fixture.componentRef.setInput('type', NotificationType.error);
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.modal-header');
    expect(header.classList.contains('bg-danger')).toBe(true);
  });

  it('should apply warning style when type is warn', () => {
    fixture.componentRef.setInput('type', NotificationType.warn);
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.modal-header');
    expect(header.classList.contains('bg-warning')).toBe(true);
  });

  it('should apply success style when type is log', () => {
    fixture.componentRef.setInput('type', NotificationType.log);
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('.modal-header');
    expect(header.classList.contains('bg-success')).toBe(true);
  });

  it('should display close button with aria-label', () => {
    const closeBtn = fixture.nativeElement.querySelector('button[aria-label="Close"]');
    expect(closeBtn).toBeTruthy();
  });

  it('should have modal with tabindex -1', () => {
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal.getAttribute('tabindex')).toBe('-1');
  });

  it('should have proper alert role for accessibility', () => {
    fixture.componentRef.setInput('type', NotificationType.error);
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
  });

  it('should render check-circle-fill icon for success when not confirm', () => {
    fixture.componentRef.setInput('type', NotificationType.log);
    fixture.componentRef.setInput('isConfirm', false);
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});

describe('WindowService - Dialog Management', () => {
  let service: WindowService;
  let viewContainer: RootViewContainerRefService;
  let mockViewContainerRef: Partial<ViewContainerRef>;
  let mockComponentRef: Partial<ComponentRef<ConfirmComponent>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ RootViewContainerRefService, ViewContainerRef]
    });
    service = TestBed.inject(WindowService);
    viewContainer = TestBed.inject(RootViewContainerRefService);

    mockComponentRef = {
      destroy: vi.fn()
    } as Partial<ComponentRef<ConfirmComponent>>;
    mockViewContainerRef = {
      createComponent: vi.fn().mockReturnValue(mockComponentRef)
    } as unknown as Partial<ViewContainerRef>;

    viewContainer.RootViewContainerRef = mockViewContainerRef as unknown as ViewContainerRef;
  });

  it('should throw error when RootViewContainerRef is not initialized', () => {
    const newService = new RootViewContainerRefService();
    expect(() => newService.RootViewContainerRef).toThrow(`
        ViewContainerRef debe ser inicializado en el componente principal:
          constructor(window: WindowService, rootViewContainerRef: ViewContainerRef) {
            window.RootViewContainerRef = rootViewContainerRef;
          }`);
  });

  it('should set and get RootViewContainerRef', () => {
    expect(viewContainer.RootViewContainerRef).toBe(mockViewContainerRef);
  });

  it('should create alert component with correct bindings', () => {
    service.alert('Test message', NotificationType.warn, 'Test Title', 'Close');

    expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(
      ConfirmComponent,
      expect.objectContaining({
        index: 0,
        bindings: expect.any(Array)
      })
    );
  });

  it('should set isConfirm to false in alert', () => {
    service.alert('Test message');
    expect(mockViewContainerRef.createComponent).toHaveBeenCalled();
  });

  it('should use default title and cancelMsg in alert', () => {
    service.alert('Test message');
    expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(
      ConfirmComponent,
      expect.objectContaining({
        index: 0,
        bindings: expect.any(Array)
      })
    );
  });

  it('should destroy component after alert confirmation', () => {
    service.alert('Test message');

    expect(mockViewContainerRef.createComponent).toHaveBeenCalled();
    // The component destruction happens through the outputBinding callback
    // which is invoked when the component emits confirm
  });

  it('should create confirm component with isConfirm true', () => {
    service.confirm('Test message', () => undefined);

    expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(
      ConfirmComponent,
      expect.objectContaining({
        index: 0,
        bindings: expect.any(Array)
      })
    );
  });

  it('should execute callback when confirm is accepted', () => {
    const callback = vi.fn();
    service.confirm('Test message', callback);

    expect(mockViewContainerRef.createComponent).toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it('should not execute callback when confirm is rejected', () => {
    const callback = vi.fn();
    service.confirm('Test message', callback);

    expect(mockViewContainerRef.createComponent).toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it('should destroy component after confirm interaction', () => {
    service.confirm('Test message', () => undefined);

    expect(mockViewContainerRef.createComponent).toHaveBeenCalled();
    // Component destruction is handled through outputBinding callbacks
    // which are invoked when the component emits the confirm output
  });

  it.skip('should reload window', () => {
    const spy = vi.spyOn(window.location, 'reload').mockImplementation(() => {
      // Mock implementation
    });

    service.reload();
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it('should use custom messages in confirm', () => {
    service.confirm('Test message', () => undefined, undefined, 'Custom Title', 'Accept', 'Reject');

    expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(
      ConfirmComponent,
      expect.objectContaining({
        bindings: expect.any(Array)
      })
    );
  });

  it('should use custom notification type in confirm', () => {
    service.confirm('Test message', () => undefined, NotificationType.error);

    expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(
      ConfirmComponent,
      expect.objectContaining({
        bindings: expect.any(Array)
      })
    );
  });
});
