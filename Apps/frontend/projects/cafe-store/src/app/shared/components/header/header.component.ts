import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../../cart.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly cartService = inject(CartService);
  private readonly DestroyRef = inject(DestroyRef);
  protected readonly cartItemsCount = signal<number>(
    this.cartService.getTotalQuantityCount()
  );

  constructor() {
    this.cartService.cartUpdated$
      .pipe(takeUntilDestroyed(this.DestroyRef))
      .subscribe((): void => {
        this.cartItemsCount.set(this.cartService.getTotalQuantityCount());
      });
  }
}
