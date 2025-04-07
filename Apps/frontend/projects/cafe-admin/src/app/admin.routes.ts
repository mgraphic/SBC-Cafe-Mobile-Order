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
];
