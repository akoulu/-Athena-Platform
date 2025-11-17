import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'outlined' | 'elevated' = 'default';
  @Input() clickable = false;

  get cardClasses(): string {
    return [
      'card',
      `card--${this.variant}`,
      `card--padding-${this.padding}`,
      this.clickable ? 'card--clickable' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
