import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();

    const routerSpy = {
      events: routerEventsSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    component = TestBed.createComponent(AppComponent).componentInstance;
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
});
