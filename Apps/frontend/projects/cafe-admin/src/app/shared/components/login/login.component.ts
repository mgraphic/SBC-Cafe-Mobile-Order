import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  protected readonly email = signal('');
  protected readonly password = signal('');

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onLogin() {
    console.log('Login button clicked');
    this.authService
      .login(this.email(), this.password())
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
}
