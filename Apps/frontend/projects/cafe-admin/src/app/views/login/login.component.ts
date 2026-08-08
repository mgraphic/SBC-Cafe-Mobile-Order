import { Component, inject, input, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';
import { SharedModule } from '../../shared/shared.module';
import { ToastService } from '../../../../../shared-lib/src/public-api';

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  protected readonly loginMode = signal<'password' | 'forgot-password' | 'otp'>(
    'password',
  );
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly otp = signal('');
  protected readonly sendTo = model<'email' | 'sms'>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected login() {
    if (!this.email() || !this.password()) {
      this.toastService.showInfo(
        'Email and password must be provided for password login',
      );
      return;
    }

    this.authService
      .login(this.email(), this.password())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.toastService.showError('Login failed: ' + err.error.message);
        },
      });
  }

  protected requestOtp() {
    if (!this.email() || !this.sendTo()) {
      this.toastService.showInfo(
        'Email and sendTo must be provided to request OTP',
      );
      return;
    }

    this.authService
      .getOtp(this.email(), this.sendTo()!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            `OTP sent successfully, check your ${this.sendTo()} for the OTP code.`,
          );
          this.loginMode.set('otp');
        },
        error: (err) => {
          this.toastService.showError(
            'Failed to send OTP: ' + err.error.message,
          );
        },
      });
  }

  protected loginWithOtp() {
    if (!this.email() || !this.otp()) {
      this.toastService.showInfo(
        'Email and OTP must be provided for OTP login',
      );
      return;
    }

    this.authService
      .loginOtp(this.email(), this.otp())
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.router.navigate(['/change-password']);
        },
        error: (err) => {
          this.toastService.showError('OTP login failed: ' + err.error.message);
        },
      });
  }
}
