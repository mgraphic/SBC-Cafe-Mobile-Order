import {
  Routes,
  UrlMatcher,
  UrlMatchResult,
  UrlSegment,
} from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { isProductId } from 'sbc-cafe-shared-module';

const detailsMatcher: UrlMatcher = (
  segments: UrlSegment[],
): UrlMatchResult | null => {
  if (segments.length !== 1) return null;
  const isPid = isProductId(segments[0].path);
  return {
    consumed: segments,
    posParams: isPid ? { productId: segments[0] } : { slug: segments[0] },
  };
};

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
    path: 'details',
    children: [
      {
        matcher: detailsMatcher,
        loadComponent: () =>
          import('./views/details/details.component').then(
            (m) => m.DetailsComponent,
          ),
      },
    ],
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./views/cart/cart.component').then((m) => m.CartComponent),
  },
];
