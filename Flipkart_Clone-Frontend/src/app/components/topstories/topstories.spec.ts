import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Topstories } from './topstories';

describe('Topstories', () => {
  let component: Topstories;
  let fixture: ComponentFixture<Topstories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topstories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Topstories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
