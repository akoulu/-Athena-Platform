import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'lib-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnInit {
  @Input() message = '';
  @Input() type: ToastType = 'info';
  @Input() duration = 5000;
  @Input() closable = true;
  @Output() closeEvent = new EventEmitter<void>();

  private timeoutId?: number;

  ngOnInit(): void {
    if (this.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.onClose();
      }, this.duration);
    }
  }

  onClose(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.closeEvent.emit();
  }

  get toastClasses(): string {
    return ['toast', `toast--${this.type}`].filter(Boolean).join(' ');
  }

  get icon(): string {
    switch (this.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  }
}
