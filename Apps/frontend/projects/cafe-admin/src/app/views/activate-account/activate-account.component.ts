import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsersService } from '../../shared/services/users.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../../shared-lib/src/public-api';

@Component({
    selector: 'app-activate-account',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './activate-account.component.html',
    styleUrl: './activate-account.component.scss'
})
export class ActivateAccountComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  protected readonly userId = this.route.snapshot.params['id'];
  protected readonly canActivate = signal(false);
  protected readonly completed = signal(false);
  protected readonly activateForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: [
      '',
      [Validators.required, this.passwordMatchValidator.bind(this)],
    ],
  });

  ngOnInit() {
    this.usersService.canActivateUser(this.userId).subscribe({
      next: (canActivate) => {
        if (canActivate) {
          console.log('User can be activated');
          this.canActivate.set(true);
        } else {
          console.error('User cannot be activated');
          // Handle the case where the user cannot be activated
        }
      },
      error: (err) => {
        console.error('Error checking user activation:', err);
        // Handle the error case
      },
    });
  }

  private passwordMatchValidator(
    control: any,
  ): { [key: string]: boolean } | null {
    if (
      this.activateForm &&
      this.activateForm.get('password')?.value !== control.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  protected onSubmit() {
    if (this.activateForm.valid) {
      const { password } = this.activateForm.value;
      this.usersService.activateUser(this.userId, password!).subscribe({
        next: () => {
          console.log('User activated successfully');
          this.completed.set(true);
          this.toastService.showSuccess('Account activated successfully!');
          // Handle successful activation (e.g., navigate to a different page)
        },
        error: (err) => {
          console.error('Error activating user:', err);
          this.toastService.showError(
            'Error activating account. Please try again.',
          );
          // Handle activation error
        },
      });
    }
  }
}
