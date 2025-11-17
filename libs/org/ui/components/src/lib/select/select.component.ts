import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'lib-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() disabled = false;
  @Input() required = false;
  @Input() id?: string;
  @Input() name?: string;
  @Input() error?: string;
  @Input() hint?: string;
  @Input() label?: string;
  @Output() blurEvent = new EventEmitter<FocusEvent>();
  @Output() focusEvent = new EventEmitter<FocusEvent>();
  @Output() valueChange = new EventEmitter<string | number>();

  value: string | number | null = null;
  private onChange = (_value: string | number | null): void => void 0;
  private onTouched = (): void => void 0;

  private cdr = inject(ChangeDetectorRef);

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value || null;
    this.onChange(this.value);
    this.valueChange.emit(this.value as string | number);
    this.cdr.markForCheck();
  }

  onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurEvent.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.focusEvent.emit(event);
  }

  // ControlValueAccessor implementation
  writeValue(value: string | number | null): void {
    this.value = value || null;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  get hasError(): boolean {
    return !!this.error;
  }

  get selectedOption(): SelectOption | undefined {
    return this.options.find((opt) => opt.value === this.value);
  }
}
