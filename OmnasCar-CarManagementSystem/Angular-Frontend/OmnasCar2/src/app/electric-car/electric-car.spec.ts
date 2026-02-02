import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectricCar } from './electric-car';

describe('ElectricCar', () => {
  let component: ElectricCar;
  let fixture: ComponentFixture<ElectricCar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectricCar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectricCar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
