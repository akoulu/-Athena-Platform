import { Component, Input, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  template?: TemplateRef<{ $implicit: T; column: TableColumn<T> }>;
  width?: string;
}

@Component({
  selector: 'lib-table',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T = unknown> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No data available';
  @Input() striped = false;
  @Input() hoverable = true;

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  onSort(column: TableColumn<T>): void {
    if (!column.sortable) {
      return;
    }

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(column: TableColumn<T>): string {
    if (this.sortColumn !== column.key) {
      return '⇅';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
}
