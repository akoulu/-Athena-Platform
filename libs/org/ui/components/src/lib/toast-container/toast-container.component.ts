import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent, ToastType } from '../toast/toast.component';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  closable?: boolean;
}

@Component({
  selector: 'lib-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  toasts: Toast[] = [];

  addToast(toast: Omit<Toast, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random()}`;
    this.toasts = [...this.toasts, { ...toast, id }];
    return id;
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
  }

  onToastClose(id: string): void {
    this.removeToast(id);
  }
}
