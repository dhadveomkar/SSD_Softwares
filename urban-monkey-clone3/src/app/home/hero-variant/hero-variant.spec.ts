import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroVariant } from './hero-variant';

describe('HeroVariant', () => {
  let component: HeroVariant;
  let fixture: ComponentFixture<HeroVariant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroVariant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroVariant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
