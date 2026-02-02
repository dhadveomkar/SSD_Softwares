import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastSaleComponent } from './last-sale';
import { LastSale } from '../home/last-sale/last-sale';

describe('LastSale', () => {
  let component: LastSale;
  let fixture: ComponentFixture<LastSale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastSale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastSale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
