import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() required = false;
  @Input() id?: string;

  get hasError(): boolean {
    return !!this.error;
  }
}
