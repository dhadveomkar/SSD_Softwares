import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Smartphonemodels } from './smartphonemodels';

describe('Smartphonemodels', () => {
  let component: Smartphonemodels;
  let fixture: ComponentFixture<Smartphonemodels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Smartphonemodels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Smartphonemodels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
