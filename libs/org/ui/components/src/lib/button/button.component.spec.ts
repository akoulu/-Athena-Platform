import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clicked event when clicked', () => {
    jest.spyOn(component.clicked, 'emit');
    const event = new MouseEvent('click');
    component.onClick(event);
    expect(component.clicked.emit).toHaveBeenCalledWith(event);
  });

  it('should not emit when disabled', () => {
    component.disabled = true;
    jest.spyOn(component.clicked, 'emit');
    component.onClick(new MouseEvent('click'));
    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should not emit when loading', () => {
    component.loading = true;
    jest.spyOn(component.clicked, 'emit');
    component.onClick(new MouseEvent('click'));
    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should apply correct variant classes', () => {
    component.variant = 'primary';
    fixture.detectChanges();
    expect(component.buttonClasses).toContain('btn--primary');

    component.variant = 'danger';
    fixture.detectChanges();
    expect(component.buttonClasses).toContain('btn--danger');
  });

  it('should apply correct size classes', () => {
    component.size = 'sm';
    fixture.detectChanges();
    expect(component.buttonClasses).toContain('btn--sm');

    component.size = 'lg';
    fixture.detectChanges();
    expect(component.buttonClasses).toContain('btn--lg');
  });

  it('should apply full-width class when fullWidth is true', () => {
    component.fullWidth = true;
    fixture.detectChanges();
    expect(component.buttonClasses).toContain('btn--full-width');
  });
});
