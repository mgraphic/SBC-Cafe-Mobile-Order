import {
  Component,
  OnInit,
  inject,
  DestroyRef,
  viewChild,
  TemplateRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartItem } from '../../shared/cart.model';
import { CartService } from '../../shared/cart.service';
import {
  PhoneInputComponent,
  SharedModule,
  validateEmail,
  validatePhoneNumber,
} from '../../../../../shared-lib/src/public-api';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { StripeCheckoutSessionMetadata } from 'sbc-cafe-shared-module';

@Component({
  selector: 'app-cart',
  imports: [SharedModule, ReactiveFormsModule, PhoneInputComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly checkoutModal =
    viewChild<TemplateRef<null>>('checkoutModal');
  protected cartItems: CartItem[] = [];
  protected readonly cartService = inject(CartService);
  protected readonly modalService = inject(NgbModal);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly checkoutForm = new FormGroup(
    {
      name: new FormControl<string | null>(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
      phone: new FormControl<string | null>(null, [validatePhoneNumber]),
      email: new FormControl<string | null>(null, [
        Validators.email,
        validateEmail,
      ]),
    },
    { validators: CartComponent.atLeastOneRequired },
  );

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();

    this.cartService.cartUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
        this.cartItems = this.cartService.getItems();
      });
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }

  onCheckout(): void {
    this.checkoutForm.reset();
    this.modalService.open(this.checkoutModal(), { size: 'lg' });
  }

  onContinueCheckout(): void {
    this.checkoutForm.markAllAsTouched();
    if (this.checkoutForm.valid) {
      const { name, phone, email } = this.checkoutForm.value;
      console.log('Checkout with:', { name, phone, email });
      this.cartService.submitOrder({
        customerName: name || 'Anonymous',
        customerEmail: email || undefined,
        customerMobile: phone || undefined,
      } as StripeCheckoutSessionMetadata);
      this.modalService.dismissAll();
    }
  }

  private static atLeastOneRequired(
    group: AbstractControl,
  ): ValidationErrors | null {
    const phone = (group as FormGroup).get('phone')?.value;
    const email = (group as FormGroup).get('email')?.value;
    return phone || email ? null : { atLeastOneRequired: true };
  }
}
