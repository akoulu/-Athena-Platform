import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataAccessDemographicsApi } from './data-access-demographics-api';

describe('DataAccessDemographicsApi', () => {
  let component: DataAccessDemographicsApi;
  let fixture: ComponentFixture<DataAccessDemographicsApi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAccessDemographicsApi],
    }).compileComponents();

    fixture = TestBed.createComponent(DataAccessDemographicsApi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
