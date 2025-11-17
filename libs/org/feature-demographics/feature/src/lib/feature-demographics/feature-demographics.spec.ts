import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureDemographics } from './feature-demographics';

describe('FeatureDemographics', () => {
  let component: FeatureDemographics;
  let fixture: ComponentFixture<FeatureDemographics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureDemographics],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureDemographics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
