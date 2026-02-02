import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Categorybar } from './categorybar';

describe('Categorybar', () => {
  let component: Categorybar;
  let fixture: ComponentFixture<Categorybar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categorybar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Categorybar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
