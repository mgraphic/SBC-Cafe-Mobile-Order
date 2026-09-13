import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { SharedModule } from '../../shared/shared.module';
import { NewOrdersComponent } from '../../shared/components/new-orders/new-orders.component';

@Component({
  selector: 'app-dashboard',
  imports: [SharedModule, NewOrdersComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  protected readonly user = signal(this.authService.getUser());
}
