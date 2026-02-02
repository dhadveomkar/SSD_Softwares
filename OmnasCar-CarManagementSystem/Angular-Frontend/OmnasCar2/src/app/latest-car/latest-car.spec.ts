import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestCar } from './latest-car';

describe('LatestCar', () => {
  let component: LatestCar;
  let fixture: ComponentFixture<LatestCar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestCar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestCar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
