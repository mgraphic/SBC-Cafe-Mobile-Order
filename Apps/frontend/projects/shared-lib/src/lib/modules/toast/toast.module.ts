import { NgModule } from '@angular/core';
import { ToastConfigService } from '../../services/toast-config.service';
import { ToastControllerService } from '../../services/toast-controller.service';
import { ToastService } from '../../services/toast.service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [ToastService, ToastControllerService, ToastConfigService],
})
export class ToastModule {}
