import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteCarButton } from './favorite-car-button';

describe('FavoriteCarButton', () => {
  let component: FavoriteCarButton;
  let fixture: ComponentFixture<FavoriteCarButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteCarButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteCarButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
