import {
  Component,
  OnInit,
  OnDestroy,
  input,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-count-timer',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './count-timer.component.html',
  styleUrl: './count-timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountTimerComponent implements OnInit, OnDestroy {
  public readonly startTime = input.required<string | number | Date>();
  public readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly now = signal<number>(Date.now());
  private timerId: ReturnType<typeof setInterval> | null = null;

  protected readonly elapsed = computed(() => {
    const start = this.startTime();
    if (!start) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        formatted: '00:00:00',
        totalSeconds: 0,
      };
    }

    const startDate = new Date(start);
    const startMs = startDate.getTime();
    if (isNaN(startMs)) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        formatted: '00:00:00',
        totalSeconds: 0,
      };
    }

    const diffMs = Math.max(0, this.now() - startMs);
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formatted = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
    ].join(':');

    return {
      hours,
      minutes,
      seconds,
      formatted,
      totalSeconds,
    };
  });

  public ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.now.set(Date.now());
    }, 1000);
  }

  public ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
