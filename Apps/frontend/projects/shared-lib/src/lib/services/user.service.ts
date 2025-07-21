import { Injectable } from '@angular/core';
import { JwtUserPayload, TokenUser } from 'sbc-cafe-shared-module';
import { AuthService } from '../../../../cafe-admin/src/app/shared/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends TokenUser {
  constructor(readonly authService: AuthService) {
    super(authService.getUser() || ({} as JwtUserPayload));
  }
}
