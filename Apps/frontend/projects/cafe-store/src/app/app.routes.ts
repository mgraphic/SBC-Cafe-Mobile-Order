import {
  Routes,
  UrlMatcher,
  UrlMatchResult,
  UrlSegment,
} from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { isProductId } from 'sbc-cafe-shared-module';
import { checkStoreStateGuard } from './shared/guards/check-store-state.guard';

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
    data: { allowWhenStoreClosed: true },
    component: HomeComponent,
  },
  {
    path: 'menu',
    canActivate: [checkStoreStateGuard],
    loadComponent: () =>
      import('./views/menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'details',
    canActivate: [checkStoreStateGuard],
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
    canActivate: [checkStoreStateGuard],
    loadComponent: () =>
      import('./views/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'order-confirmation',
    data: { allowWhenStoreClosed: true },
    loadComponent: () =>
      import('./views/order-confirmation/order-confirmation.component').then(
        (m) => m.OrderConfirmationComponent,
      ),
  },
  {
    path: 'store-closed',
    data: { allowWhenStoreClosed: true },
    loadComponent: () =>
      import('./views/store-closed/store-closed.component').then(
        (m) => m.StoreClosedComponent,
      ),
  },
];
