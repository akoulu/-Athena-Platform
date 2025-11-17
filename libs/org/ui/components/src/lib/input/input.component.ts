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

@Component({
  selector: 'lib-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() autocomplete?: string;
  @Input() id?: string;
  @Input() name?: string;
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() step?: number | string;
  @Input() maxlength?: number;
  @Input() minlength?: number;
  @Input() pattern?: string;
  @Input() error?: string;
  @Input() hint?: string;
  @Input() label?: string;
  @Input() showPasswordToggle = false;
  @Output() blurEvent = new EventEmitter<FocusEvent>();
  @Output() focusEvent = new EventEmitter<FocusEvent>();

  value = '';
  showPassword = false;
  private onChange = (_value: string): void => void 0;
  private onTouched = (): void => void 0;

  private cdr = inject(ChangeDetectorRef);

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurEvent.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.focusEvent.emit(event);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.type = this.showPassword ? 'text' : 'password';
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  get inputType(): string {
    if (this.type === 'password' && this.showPasswordToggle) {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  get hasError(): boolean {
    return !!this.error;
  }
}
