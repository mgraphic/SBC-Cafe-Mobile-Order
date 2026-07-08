import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Validator } from 'sbc-cafe-shared-module';

export function validateEmail(
  formControl: AbstractControl,
): ValidationErrors | null {
  const email = formControl.value;

  if (!email) {
    return null;
  }

  return Validator.email(email) ? null : { invalidEmail: true };
}

export function validatePhoneNumber(
  formControl: AbstractControl,
): ValidationErrors | null {
  const phone = formControl.value;

  if (!phone) {
    return null;
  }

  return Validator.phoneNumber(phone) ? null : { invalidPhoneNumber: true };
}

export function validatePrice(
  formControl: AbstractControl,
): ValidationErrors | null {
  const price = formControl.value;

  if (price === null || price === undefined) {
    return null;
  }

  return Validator.price(price) ? null : { invalidPrice: true };
}
