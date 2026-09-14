import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { CountTimerComponent } from './count-timer.component';

describe('CountTimerComponent', () => {
  let component: CountTimerComponent;
  let componentRef: ComponentRef<CountTimerComponent>;
  let fixture: ComponentFixture<CountTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountTimerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CountTimerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('startTime', new Date().toISOString());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should format elapsed time correctly', () => {
    const twoMinutesAgo = new Date(Date.now() - 125000).toISOString();
    componentRef.setInput('startTime', twoMinutesAgo);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('00:02:05');
  });

  it('should update elapsed time every second', fakeAsync(() => {
    const startTime = new Date().toISOString();
    componentRef.setInput('startTime', startTime);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('00:00:00');

    tick(3000);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('00:00:03');

    fixture.destroy();
  }));

  it('should handle invalid startTime gracefully', () => {
    componentRef.setInput('startTime', 'invalid-date');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('00:00:00');
  });
});
