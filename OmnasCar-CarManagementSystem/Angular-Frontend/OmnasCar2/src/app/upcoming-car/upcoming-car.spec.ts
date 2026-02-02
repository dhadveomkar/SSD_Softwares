import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingCar } from './upcoming-car';

describe('UpcomingCar', () => {
  let component: UpcomingCar;
  let fixture: ComponentFixture<UpcomingCar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingCar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingCar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
