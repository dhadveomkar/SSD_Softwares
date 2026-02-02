import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Titleparagraph } from './titleparagraph';

describe('Titleparagraph', () => {
  let component: Titleparagraph;
  let fixture: ComponentFixture<Titleparagraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Titleparagraph]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Titleparagraph);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
