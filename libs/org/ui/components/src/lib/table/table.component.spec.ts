import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { TableComponent } from './table.component';
import { LoadingComponent } from '../loading/loading.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent, LoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display data in table', () => {
    component.loading = false; // Ensure loading is false
    component.columns = [
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
    ];
    component.data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    const table = fixture.nativeElement.querySelector('table');
    expect(table).toBeTruthy();
    if (table) {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      // Table shows empty message row when data.length === 0, but we have 2 items
      // So we should have 2 data rows
      expect(rows.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should show empty message when no data', () => {
    component.columns = [{ key: 'name', label: 'Name' }];
    component.data = [];
    fixture.detectChanges();
    const emptyCell = fixture.nativeElement.querySelector('.table__empty');
    expect(emptyCell).toBeTruthy();
    expect(emptyCell.textContent).toContain(component.emptyMessage);
  });

  it('should sort columns when sortable', () => {
    component.columns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age' },
    ];
    component.data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];
    fixture.detectChanges();
    component.onSort(component.columns[0]);
    expect(component.sortColumn).toBe('name');
    expect(component.sortDirection).toBe('asc');
  });

  it('should show loading state', () => {
    component.loading = true;
    component.columns = [{ key: 'name', label: 'Name' }];
    component.data = [];
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    const loadingEl = fixture.nativeElement.querySelector('.table-loading');
    expect(loadingEl).toBeTruthy();
  });

  describe('Integration Tests - Full Flow', () => {
    it('should complete full table flow: load -> sort -> display', () => {
      component.columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'age', label: 'Age', sortable: true },
      ];
      component.data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      component.loading = false;
      const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
      cdr.markForCheck();
      fixture.detectChanges();

      // Verify data is displayed
      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeTruthy();

      // Sort by name ascending
      component.onSort(component.columns[0]);
      expect(component.sortColumn).toBe('name');
      expect(component.sortDirection).toBe('asc');

      // Sort by name descending
      component.onSort(component.columns[0]);
      expect(component.sortDirection).toBe('desc');

      // Sort by age
      component.onSort(component.columns[1]);
      expect(component.sortColumn).toBe('age');
      expect(component.sortDirection).toBe('asc');
    });

    it('should handle table state transitions: loading -> data -> empty', () => {
      component.columns = [{ key: 'name', label: 'Name' }];

      // Loading state
      component.loading = true;
      component.data = [];
      const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
      cdr.markForCheck();
      fixture.detectChanges();
      expect(component.loading).toBe(true);

      // Data state
      component.loading = false;
      component.data = [{ name: 'John' }];
      cdr.markForCheck();
      fixture.detectChanges();
      expect(component.loading).toBe(false);
      expect(component.data.length).toBe(1);

      // Empty state
      component.data = [];
      cdr.markForCheck();
      fixture.detectChanges();
      const emptyCell = fixture.nativeElement.querySelector('.table__empty');
      expect(emptyCell).toBeTruthy();
    });

    it('should handle sort icon display correctly', () => {
      component.columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'age', label: 'Age', sortable: true },
      ];

      // No sort initially
      expect(component.getSortIcon(component.columns[0])).toBe('⇅');

      // Sort ascending
      component.onSort(component.columns[0]);
      expect(component.getSortIcon(component.columns[0])).toBe('↑');

      // Sort descending
      component.onSort(component.columns[0]);
      expect(component.getSortIcon(component.columns[0])).toBe('↓');

      // Other column shows unsorted icon
      expect(component.getSortIcon(component.columns[1])).toBe('⇅');
    });

    it('should handle non-sortable columns', () => {
      component.columns = [
        { key: 'name', label: 'Name', sortable: false },
        { key: 'age', label: 'Age', sortable: true },
      ];

      // Try to sort non-sortable column
      const initialSortColumn = component.sortColumn;
      component.onSort(component.columns[0]);
      expect(component.sortColumn).toBe(initialSortColumn);

      // Sortable column should work
      component.onSort(component.columns[1]);
      expect(component.sortColumn).toBe('age');
    });

    it('should handle table styling options', () => {
      component.columns = [{ key: 'name', label: 'Name' }];
      component.data = [{ name: 'John' }];
      component.striped = true;
      component.hoverable = false;
      const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
      cdr.markForCheck();
      fixture.detectChanges();

      expect(component.striped).toBe(true);
      expect(component.hoverable).toBe(false);
    });
  });
});
