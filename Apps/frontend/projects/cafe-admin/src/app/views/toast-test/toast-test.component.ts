import { Component, inject } from '@angular/core';
import { Subject } from 'rxjs';
import {
  ToastService,
  ToastConfigService,
} from '../../../../../shared-lib/src/public-api';

@Component({
  selector: 'app-toast-test',
  standalone: true,
  templateUrl: './toast-test.component.html',
  styleUrl: './toast-test.component.scss',
})
export class ToastTestComponent {
  toastService = inject(ToastService);
  toastConfigService = inject(ToastConfigService);
  closeRef = new Subject<void>();

  openNonAutohideToast(): void {
    this.toastService.show({
      content:
        'This toast will not autohide. Click the close button to hide it.',
      type: 'info',
      autohide: false,
      hideObserver: this.closeRef,
    });
  }
}
