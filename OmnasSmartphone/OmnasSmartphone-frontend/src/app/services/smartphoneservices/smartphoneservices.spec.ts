import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Smartphoneservices } from './smartphoneservices';

describe('Smartphoneservices', () => {
  let component: Smartphoneservices;
  let fixture: ComponentFixture<Smartphoneservices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Smartphoneservices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Smartphoneservices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
