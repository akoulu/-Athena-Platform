import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'spinner' | 'dots' | 'pulse' = 'spinner';
  @Input() message?: string;
  @Input() fullScreen = false;

  get loadingClasses(): string {
    return [
      'loading',
      `loading--${this.variant}`,
      `loading--${this.size}`,
      this.fullScreen ? 'loading--full-screen' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
