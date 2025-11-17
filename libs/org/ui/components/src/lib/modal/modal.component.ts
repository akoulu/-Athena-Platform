import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'lib-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closable = true;
  @Input() showFooter = true;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() showCancel = true;
  @Input() confirmVariant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Output() closeEvent = new EventEmitter<void>();
  @Output() confirmEvent = new EventEmitter<void>();
  @Output() cancelEvent = new EventEmitter<void>();
  @ViewChild('modalBackdrop', { static: false }) backdrop?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    if (this.isOpen) {
      this.disableBodyScroll();
    }
  }

  ngOnDestroy(): void {
    this.enableBodyScroll();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closable && event.target === this.backdrop?.nativeElement) {
      this.closeModal();
    }
  }

  onClose(): void {
    if (this.closable) {
      this.closeModal();
    }
  }

  onConfirm(): void {
    this.confirmEvent.emit();
  }

  onCancel(): void {
    this.cancelEvent.emit();
    this.closeModal();
  }

  private closeModal(): void {
    this.closeEvent.emit();
    this.enableBodyScroll();
  }

  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private enableBodyScroll(): void {
    document.body.style.overflow = '';
  }

  get modalClasses(): string {
    return ['modal', `modal--${this.size}`].filter(Boolean).join(' ');
  }
}
