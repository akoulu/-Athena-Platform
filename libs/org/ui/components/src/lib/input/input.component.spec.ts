import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { FormsModule } from '@angular/forms';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update value on input', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(component.value).toBe('test');
  });

  it('should toggle password visibility', () => {
    component.type = 'password';
    component.showPasswordToggle = true;
    component.showPassword = false;
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    expect(component.inputType).toBe('text');
  });

  it('should implement ControlValueAccessor', () => {
    const testValue = 'test value';
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);

    let onChangeValue: string | undefined;
    component.registerOnChange((value) => {
      onChangeValue = value;
    });
    component.onInput({ target: { value: 'new value' } } as any);
    expect(onChangeValue).toBe('new value');

    let touched = false;
    component.registerOnTouched(() => {
      touched = true;
    });
    component.onBlur(new FocusEvent('blur'));
    expect(touched).toBe(true);
  });

  it('should set disabled state', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it('should show error state when error is set', () => {
    component.error = 'Error message';
    fixture.detectChanges();
    expect(component.hasError).toBe(true);
  });
});
