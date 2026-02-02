import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Furnituredeal } from './furnituredeal';

describe('Furnituredeal', () => {
  let component: Furnituredeal;
  let fixture: ComponentFixture<Furnituredeal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Furnituredeal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Furnituredeal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
