import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { SharedModule } from '../../shared/shared.module';
import { NewOrdersComponent } from '../../shared/components/new-orders/new-orders.component';

@Component({
  selector: 'app-dashboard',
  imports: [SharedModule, NewOrdersComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
