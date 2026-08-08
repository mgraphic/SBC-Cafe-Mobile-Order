import { Route } from '@angular/router';

export const adminRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./views/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent,
      ),
  },
  {
    path: 'user-management',
    loadComponent: () =>
      import('./views/user-management/user-management.component').then(
        (c) => c.UserManagementComponent,
      ),
  },
  {
    path: 'user-logs',
    loadComponent: () =>
      import('./views/user-service-logs/user-service-logs.component').then(
        (c) => c.UserServiceLogsComponent,
      ),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./views/change-password/change-password.component').then(
        (c) => c.ChangePasswordComponent,
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
