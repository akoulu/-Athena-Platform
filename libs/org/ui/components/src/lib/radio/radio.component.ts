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
  selector: 'lib-radio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() value: string | number = '';
  @Input() name?: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() id?: string;
  @Output() valueChange = new EventEmitter<string | number>();

  selectedValue: string | number | null = null;
  private onChange = (_value: string | number | null): void => void 0;
  private onTouched = (): void => void 0;

  private cdr = inject(ChangeDetectorRef);

  get checked(): boolean {
    return this.selectedValue === this.value;
  }

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectedValue = this.value;
      this.onChange(this.selectedValue);
      this.valueChange.emit(this.value);
      this.cdr.markForCheck();
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string | number | null): void {
    this.selectedValue = value;
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
}
