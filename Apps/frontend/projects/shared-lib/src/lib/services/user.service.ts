import { inject, Injectable, signal } from '@angular/core';
import { JwtUserPayload, TokenUser } from 'sbc-cafe-shared-module';
import { AuthService } from '../../../../cafe-admin/src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends TokenUser {
  private readonly _isLoggedInSignal = signal<boolean>(false);

  public readonly isLoggedInSignal = this._isLoggedInSignal.asReadonly();

  public constructor(readonly authService: AuthService) {
    super(authService.getUser() || ({} as JwtUserPayload));

    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this._isLoggedInSignal.set(isLoggedIn);
    });
  }

  public isLoggedIn(): boolean {
    return this._isLoggedInSignal();
  }
}
