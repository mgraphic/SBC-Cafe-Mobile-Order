import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./views/menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'details/:slug',
    loadComponent: () =>
      import('./views/details/details.component').then(
        (m) => m.DetailsComponent
      ),
  },
];
