import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import type { StoreStatusEventPayload } from 'sbc-cafe-shared-module';
import { RealtimeService } from '../../../shared-lib/src/lib/services/realtime.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerEventsSubject: Subject<any>;
  let navigateByUrl: jest.Mock;
  let activeRouteSnapshot: {
    data: Record<string, unknown>;
    firstChild: null;
  };
  let storeStatusListener:
    | ((event: { payload: StoreStatusEventPayload }) => void)
    | undefined;
  let realtimeServiceSpy: {
    joinStoreStatusAlert: jest.Mock;
    registerEventListener: jest.Mock;
  };

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();
    navigateByUrl = jest.fn();
    storeStatusListener = undefined;
    activeRouteSnapshot = { data: {}, firstChild: null };

    realtimeServiceSpy = {
      joinStoreStatusAlert: jest.fn(),
      registerEventListener: jest.fn(
        (
          _room: string,
          callback: (event: { payload: StoreStatusEventPayload }) => void,
        ) => {
          storeStatusListener = callback;
          return { takeUntilDestroyRef: jest.fn() };
        },
      ),
    };

    const routerSpy = {
      events: routerEventsSubject.asObservable(),
      navigateByUrl,
      routerState: {
        snapshot: {
          root: { data: {}, firstChild: activeRouteSnapshot },
        },
      },
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: RealtimeService,
          useValue: {
            ...realtimeServiceSpy,
            onReady: (callback: () => void) => callback(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the component with default values', () => {
    expect((component as any).showHeader).toBe(true);
    expect((component as any).showFooter).toBe(true);
  });

  it('should hide header and footer when navigating to root', () => {
    component.ngOnInit();
    routerEventsSubject.next(new NavigationEnd(1, '/', '/'));
    expect((component as any).showHeader).toBe(false);
    expect((component as any).showFooter).toBe(false);
  });

  it('should show header and footer when navigating to other routes', () => {
    component.ngOnInit();
    routerEventsSubject.next(new NavigationEnd(1, '/other', '/other'));
    expect((component as any).showHeader).toBe(true);
    expect((component as any).showFooter).toBe(true);
  });

  it('should not route to store-closed when the active route allows it', () => {
    activeRouteSnapshot.data['allowWhenStoreClosed'] = true;
    component.ngOnInit();
    routerEventsSubject.next(
      new NavigationEnd(1, '/order-confirmation', '/order-confirmation'),
    );
    (component as any).isOpen.set(false);
    fixture.detectChanges();

    expect(navigateByUrl).not.toHaveBeenCalledWith('/store-closed');
  });

  it('should join store status alerts and route to store-closed when offline', () => {
    component.ngOnInit();
    storeStatusListener?.({ payload: { isStoreOpen: false } });

    expect(realtimeServiceSpy.joinStoreStatusAlert).toHaveBeenCalled();
    expect(realtimeServiceSpy.registerEventListener).toHaveBeenCalledWith(
      'store-status-alerts',
      expect.any(Function),
    );
    expect(navigateByUrl).toHaveBeenCalledWith('/store-closed');
  });

  it('should route to menu when the store is online', () => {
    component.ngOnInit();
    storeStatusListener?.({ payload: { isStoreOpen: true } });

    expect(navigateByUrl).toHaveBeenCalledWith('/menu');
  });
});
