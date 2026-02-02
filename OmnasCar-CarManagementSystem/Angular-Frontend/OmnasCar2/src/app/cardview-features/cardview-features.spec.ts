import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardviewFeatures } from './cardview-features';

describe('CardviewFeatures', () => {
  let component: CardviewFeatures;
  let fixture: ComponentFixture<CardviewFeatures>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardviewFeatures]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardviewFeatures);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
