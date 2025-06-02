import {
  Component,
  forwardRef,
  ViewChild,
  ElementRef,
  input,
  model,
} from '@angular/core';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import {
  Subject,
  OperatorFunction,
  Observable,
  debounceTime,
  distinctUntilChanged,
  filter,
  merge,
  map,
} from 'rxjs';
import { ComboboxValueType } from '../../models/shared.model';
import { comboboxValueFormatter } from '../../utilities/combobox.utils';

@Component({
  selector: 'lib-combobox',
  standalone: true,
  imports: [FormsModule, NgbTypeahead],
  templateUrl: './combobox.component.html',
  styleUrl: './combobox.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true,
    },
  ],
})
export class ComboboxComponent implements ControlValueAccessor {
  @ViewChild('instance', { static: true })
  protected readonly instance!: NgbTypeahead;
  @ViewChild('input', { static: true })
  protected readonly input!: ElementRef<HTMLInputElement>;

  public readonly options = input.required<ComboboxValueType[]>();
  public readonly model = model<ComboboxValueType>();

  protected readonly focus$ = new Subject<string>();
  protected readonly click$ = new Subject<string>();

  private onChange = (value: ComboboxValueType | undefined): void => {};
  private onTouched = (): void => {};
  protected readonly formatter = comboboxValueFormatter;
  protected readonly search: OperatorFunction<
    ComboboxValueType,
    readonly ComboboxValueType[]
  > = (
    text$: Observable<ComboboxValueType>
  ): Observable<ComboboxValueType[]> => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.click$.pipe(
      filter(() => !this.instance.isPopupOpen())
    );
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        term === ''
          ? this.options()
          : this.options().filter(
              (v) =>
                this.formatter(v)
                  .toLowerCase()
                  .indexOf(this.formatter(term).toLowerCase()) > -1
            )
      )
    );
  };

  public writeValue(value: ComboboxValueType): void {
    this.model.set(value);
  }

  public registerOnChange(
    fn: (value: ComboboxValueType | undefined) => void
  ): void {
    this.onChange = fn;
    this.model.subscribe(fn);
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.input.nativeElement.disabled = isDisabled;
  }

  public onModelChange(value: ComboboxValueType | undefined): void {
    const matchedOption = this.options().find((option) => {
      return (
        this.formatter(option).toLowerCase() ===
        this.formatter(value || '').toLowerCase()
      );
    });
    if (matchedOption) {
      this.model.set(matchedOption);
      this.onChange(matchedOption);
    } else {
      this.model.set(value);
      this.onChange(value);
    }

    this.onTouched();
  }

  public clear(): void {
    this.model.set(undefined);
    this.onChange(undefined);
  }

  protected onValueChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    const matchedOption = this.options().find(
      (option) =>
        this.formatter(option).toLowerCase() === inputValue.toLowerCase()
    );

    if (matchedOption) {
      this.model.set(matchedOption);
      return;
    }

    this.model.set(inputValue);
  }
}
