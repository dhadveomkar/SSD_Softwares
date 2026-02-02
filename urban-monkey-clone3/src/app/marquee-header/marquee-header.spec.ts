import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarqueeHeader } from './marquee-header';

describe('MarqueeHeader', () => {
  let component: MarqueeHeader;
  let fixture: ComponentFixture<MarqueeHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarqueeHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarqueeHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
