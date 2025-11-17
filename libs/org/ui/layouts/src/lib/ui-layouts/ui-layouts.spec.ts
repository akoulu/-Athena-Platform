import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiLayouts } from './ui-layouts';

describe('UiLayouts', () => {
  let component: UiLayouts;
  let fixture: ComponentFixture<UiLayouts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiLayouts],
    }).compileComponents();

    fixture = TestBed.createComponent(UiLayouts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
