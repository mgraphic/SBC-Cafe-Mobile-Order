/// <reference path="../../../intl-tel-input-utils.d.ts" />
import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
  PLATFORM_ID,
  inject,
  AfterViewInit,
  viewChild,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { CountryCode } from 'libphonenumber-js';
import { NgxsmkTelInputComponent } from 'ngxsmk-tel-input';
import { NumberInput } from '@angular/cdk/coercion';

@Component({
  selector: 'lib-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxsmkTelInputComponent],
  templateUrl: './phone-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
})
export class PhoneInputComponent
  implements ControlValueAccessor, AfterViewInit
{
  public readonly name = input<string>('phone');
  public readonly label = input<string>();
  public readonly tabIndex = input<NumberInput | null>(null);
  public readonly theme = input<'light' | 'dark' | 'auto'>('light');
  public readonly disabledInput = input<boolean, unknown>(false, {
    transform: booleanAttribute,
    alias: 'disabled',
  });
  private readonly telInput = viewChild('telInput', {
    read: NgxsmkTelInputComponent,
  });
  private readonly disabledState = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.disabledState(),
  );

  protected readonly initialCountry: CountryCode = 'US';
  protected readonly onlyCountries: CountryCode[] = ['US', 'CA'];
  protected readonly separateDialCode = false;
  protected readonly lockWhenValid = true;
  protected readonly formatWhenValid = 'typing';

  protected readonly valueModel = model<string | null>(null);

  // ControlValueAccessor callbacks
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  public get value(): string | null {
    return this.valueModel();
  }

  public set value(v: string | null) {
    if (v !== this.valueModel()) {
      this.valueModel.set(v);
      this.onChange(v);
    }
  }

  public constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      import('intl-tel-input').then(({ default: intlTelInput }) => {
        intlTelInput.attachUtils(
          () => import('intl-tel-input/build/js/utils.js'),
        );
      });
    }
  }

  public ngAfterViewInit(): void {
    if (this.tabIndex() !== null) {
      const inputElement = this.telInput();
      inputElement?.inputRef.nativeElement.setAttribute(
        'tabIndex',
        this.tabIndex()!.toString(),
      );
    }
  }

  public writeValue(value: string | null): void {
    this.valueModel.set(value);
  }

  public registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  public touch(): void {
    this.onTouched();
  }
}
