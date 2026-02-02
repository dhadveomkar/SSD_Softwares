import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Topdeals } from './topdeals';

describe('Topdeals', () => {
  let component: Topdeals;
  let fixture: ComponentFixture<Topdeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topdeals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Topdeals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
