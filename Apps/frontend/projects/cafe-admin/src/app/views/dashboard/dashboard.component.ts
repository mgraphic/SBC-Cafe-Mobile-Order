import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  protected readonly user = signal(this.authService.getUser());
}
