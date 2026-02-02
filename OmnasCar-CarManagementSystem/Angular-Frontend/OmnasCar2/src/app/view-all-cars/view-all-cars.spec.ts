import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllCars } from './view-all-cars';

describe('ViewAllCars', () => {
  let component: ViewAllCars;
  let fixture: ComponentFixture<ViewAllCars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllCars]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAllCars);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
