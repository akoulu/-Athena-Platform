import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { FormsModule } from '@angular/forms';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    component.options = [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should implement ControlValueAccessor', () => {
    const testValue = '1';
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);

    let onChangeValue: string | number | null | undefined;
    component.registerOnChange((value) => {
      onChangeValue = value;
    });
    const select = fixture.nativeElement.querySelector('select');
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    expect(onChangeValue).toBe('2');
  });

  it('should display options', () => {
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('should show error state when error is set', () => {
    component.error = 'Error message';
    fixture.detectChanges();
    expect(component.hasError).toBe(true);
  });
});
