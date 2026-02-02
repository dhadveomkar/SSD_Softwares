import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridScroll } from './grid-scroll';

describe('GridScroll', () => {
  let component: GridScroll;
  let fixture: ComponentFixture<GridScroll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridScroll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridScroll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
