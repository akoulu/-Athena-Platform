import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface SidebarMenuItem {
  label: string;
  route?: string;
  href?: string;
  action?: () => void;
  icon?: string;
  badge?: string | number;
  children?: SidebarMenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnChanges, OnInit {
  @Input() menuItems: SidebarMenuItem[] = [];
  @Input() collapsed = false;
  @Input() collapsible = true;
  @Output() menuItemClick = new EventEmitter<SidebarMenuItem>();
  @Output() toggleCollapse = new EventEmitter<boolean>();

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cdr.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuItems'] || changes['collapsed']) {
      this.cdr.markForCheck();
    }
  }

  onMenuItemClick(item: SidebarMenuItem, event?: Event): void {
    event?.preventDefault();
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
      this.cdr.markForCheck();
    } else {
      if (item.action) {
        item.action();
      }
      this.menuItemClick.emit(item);
    }
  }

  onToggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.toggleCollapse.emit(this.collapsed);
    this.cdr.markForCheck();
  }
}
