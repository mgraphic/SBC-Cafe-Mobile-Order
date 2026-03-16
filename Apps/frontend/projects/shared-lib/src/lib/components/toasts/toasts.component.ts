import {
  Component,
  ViewEncapsulation,
  AfterViewChecked,
  inject,
  HostBinding,
  TemplateRef,
  viewChildren,
} from '@angular/core';
import { NgbToastModule, NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { take, Observable } from 'rxjs';
import { SharedModule } from '../../../shared.module';
import {
  RequiredToastEntityOptions,
  ToastContent,
} from '../../models/toast.model';
import { ToastConfigService } from '../../services/toast-config.service';
import { ToastControllerService } from '../../services/toast-controller.service';

@Component({
    selector: 'lib-toasts',
    imports: [NgbToastModule, SharedModule],
    templateUrl: './toasts.component.html',
    styleUrls: ['./toasts.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToastsComponent implements AfterViewChecked {
  protected toastControllerService = inject(ToastControllerService);
  protected toastConfigService = inject(ToastConfigService);
  private activeToasts = new Set<RequiredToastEntityOptions>();

  @HostBinding('class') protected className =
    this.toastConfigService.getConfig().className;

  private setToastRef(
    toastRef: NgbToast,
    toastData: RequiredToastEntityOptions,
  ): void {
    if (this.activeToasts.has(toastData)) {
      return;
    }

    this.activeToasts.add(toastData);

    toastRef.hidden.pipe(take(1)).subscribe(() => {
      this.toastControllerService.remove(toastData);
      this.activeToasts.delete(toastData);
    });

    if (toastData.hideObserver instanceof Observable) {
      toastData.hideObserver.pipe(take(1)).subscribe(() => {
        toastRef.hide();
      });
    }
  }

  protected isTemplateRef(
    toastContent: ToastContent,
  ): toastContent is TemplateRef<any> {
    return toastContent instanceof TemplateRef;
  }

  private toastRefs = viewChildren(NgbToast);
  public ngAfterViewChecked(): void {
    this.toastRefs().forEach((toastRef) => {
      const nativeEl = toastRef['_element'].nativeElement as HTMLElement;
      const toastId = nativeEl.getAttribute('data-toastId');
      const toastData = this.toastControllerService
        .toasts()
        .find((t) => t.id === toastId);

      if (toastData) {
        this.setToastRef(toastRef, toastData);
      }
    });
  }
}
