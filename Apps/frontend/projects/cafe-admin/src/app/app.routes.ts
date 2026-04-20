import { Routes } from '@angular/router';
import { authGuard } from './shared/auth-guard';
import { adminRoutes } from './admin.routes';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: adminRoutes,
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/components/login/login.component').then(
        (c) => c.LoginComponent,
      ),
  },
  {
    path: 'logout',
    loadComponent: () =>
      import('./shared/components/logout/logout.component').then(
        (c) => c.LogoutComponent,
      ),
  },
  {
    path: 'activate-account/:id',
    loadComponent: () =>
      import('./views/activate-account/activate-account.component').then(
        (c) => c.ActivateAccountComponent,
      ),
  },
  {
    path: 'toast-test',
    loadComponent: () =>
      import('./views/toast-test/toast-test.component').then(
        (c) => c.ToastTestComponent,
      ),
  },
  {
    path: 'orders-test',
    loadComponent: () =>
      import('./views/orders-test/orders-test.component').then(
        (c) => c.OrdersTestComponent,
      ),
  },
];
