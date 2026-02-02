import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Homepageimage } from './homepageimage';

describe('Homepageimage', () => {
  let component: Homepageimage;
  let fixture: ComponentFixture<Homepageimage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Homepageimage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Homepageimage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
