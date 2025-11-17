import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { FormsModule } from '@angular/forms';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should implement ControlValueAccessor', () => {
    component.writeValue(true);
    expect(component.checked).toBe(true);

    let onChangeValue: boolean | undefined;
    component.registerOnChange((value) => {
      onChangeValue = value;
    });
    const checkbox = fixture.nativeElement.querySelector('input');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(onChangeValue).toBe(true);
  });

  it('should toggle checked state', () => {
    component.checked = false;
    component.onToggle({ target: { checked: true } } as any);
    expect(component.checked).toBe(true);
  });

  it('should emit change event', () => {
    jest.spyOn(component.valueChange, 'emit');
    component.onToggle({ target: { checked: true } } as any);
    expect(component.valueChange.emit).toHaveBeenCalledWith(true);
  });
});
