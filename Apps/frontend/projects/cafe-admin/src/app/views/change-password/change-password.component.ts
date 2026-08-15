import { Component, inject, signal } from '@angular/core';
import { take } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { ToastService } from '../../../../../shared-lib/src/public-api';
import { Router } from '@angular/router';
import { UsersService } from '../../shared/services/users.service';
import { UserService } from '../../../../../shared-lib/src/lib/services/user.service';

@Component({
  selector: 'app-change-password',
  imports: [SharedModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');

  private readonly usersService = inject(UsersService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected changePassword() {
    if (!this.newPassword() || !this.confirmPassword()) {
      this.toastService.showInfo(
        'New password and confirm password must be provided',
      );
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.toastService.showInfo(
        'New password and confirm password must match',
      );
      return;
    }

    this.usersService
      .changePassword(this.userService.getUserId(), this.newPassword())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Password changed successfully');
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.toastService.showError(
            'Change password failed: ' + err.error.error,
          );
        },
      });
  }
}
