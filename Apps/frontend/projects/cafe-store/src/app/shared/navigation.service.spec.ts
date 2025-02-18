import { TestBed } from '@angular/core/testing';
import { NavigationService } from './navigation.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

describe('NavigationService', () => {
  let service: NavigationService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(NavigationService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get previous url', () => {
    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(1, '/route1', '/route1')
    );

    expect(service.getPreviousUrl()).toBeUndefined();

    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(2, '/route2', '/route2')
    );

    expect(service.getPreviousUrl()).toBe('/route1');
  });

  it('should get current url', () => {
    expect(service.getCurrentUrl()).toBeUndefined();

    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(1, '/route1', '/route1')
    );

    expect(service.getCurrentUrl()).toBe('/route1');
  });

  it('should get history', () => {
    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(1, '/route1', '/route1')
    );
    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(2, '/route2', '/route2')
    );

    expect(service.getHistory()).toEqual(['/route1', '/route2']);
  });

  it('should clear history', () => {
    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(1, '/route1', '/route1')
    );
    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(2, '/route2', '/route2')
    );

    service.clearHistory();
    expect(service.getHistory()).toEqual([]);
  });

  it('should go back to previous url', () => {
    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(1, '/route1', '/route1')
    );
    (TestBed.inject(Router).events as Subject<NavigationEnd>).next(
      new NavigationEnd(2, '/route2', '/route2')
    );

    const spy = jest.spyOn(router, 'navigateByUrl');

    service.goBack();

    expect(spy).toHaveBeenCalledWith('/route1');
  });
});
