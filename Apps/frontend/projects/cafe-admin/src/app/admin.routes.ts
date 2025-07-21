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
        (c) => c.DashboardComponent
      ),
  },
  {
    path: 'user-management',
    loadComponent: () =>
      import('./views/user-management/user-management.component').then(
        (c) => c.UserManagementComponent
      ),
  },
  {
    path: 'user-logs',
    loadComponent: () =>
      import('./views/user-service-logs/user-service-logs.component').then(
        (c) => c.UserServiceLogsComponent
      ),
  },
];
