import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dealgrid } from './dealgrid';

describe('Dealgrid', () => {
  let component: Dealgrid;
  let fixture: ComponentFixture<Dealgrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dealgrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dealgrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
