import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Slidingbanner } from './slidingbanner';

describe('Slidingbanner', () => {
  let component: Slidingbanner;
  let fixture: ComponentFixture<Slidingbanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Slidingbanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Slidingbanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
