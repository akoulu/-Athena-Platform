import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface HeaderMenuItem {
  label: string;
  route?: string;
  href?: string;
  action?: () => void;
  icon?: string;
}

@Component({
  selector: 'lib-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() title = 'Athena';
  @Input() logo?: string;
  @Input() menuItems: HeaderMenuItem[] = [];
  @Input() userMenuItems: HeaderMenuItem[] = [];
  @Input() userName?: string;
  @Input() userAvatar?: string;
  @Input() showUserMenu = false;
  @Output() menuItemClick = new EventEmitter<HeaderMenuItem>();
  @Output() userMenuItemClick = new EventEmitter<HeaderMenuItem>();

  isUserMenuOpen = false;

  onMenuItemClick(item: HeaderMenuItem, event?: Event): void {
    event?.preventDefault();
    if (item.action) {
      item.action();
    }
    this.menuItemClick.emit(item);
  }

  onUserMenuItemClick(item: HeaderMenuItem, event?: Event): void {
    event?.preventDefault();
    this.isUserMenuOpen = false;
    if (item.action) {
      item.action();
    }
    this.userMenuItemClick.emit(item);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }
}
