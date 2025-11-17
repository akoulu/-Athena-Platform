import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioComponent } from './radio.component';
import { FormsModule } from '@angular/forms';

describe('RadioComponent', () => {
  let component: RadioComponent;
  let fixture: ComponentFixture<RadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    component.value = 'option1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should implement ControlValueAccessor', () => {
    component.writeValue('option1');
    expect(component.selectedValue).toBe('option1');

    let onChangeValue: string | number | null | undefined;
    component.registerOnChange((value) => {
      onChangeValue = value;
    });
    const radio = fixture.nativeElement.querySelector('input');
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    expect(onChangeValue).toBe('option1');
  });

  it('should be checked when selectedValue matches value', () => {
    component.selectedValue = 'option1';
    component.value = 'option1';
    expect(component.checked).toBe(true);

    component.selectedValue = 'option2';
    expect(component.checked).toBe(false);
  });

  it('should emit change event when toggled', () => {
    component.selectedValue = null;
    component.value = 'option1';
    jest.spyOn(component.valueChange, 'emit');
    component.onToggle({ target: { checked: true } } as any);
    expect(component.valueChange.emit).toHaveBeenCalledWith('option1');
  });
});
