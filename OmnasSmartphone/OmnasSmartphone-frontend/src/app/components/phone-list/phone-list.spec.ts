import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneList } from './phone-list';

describe('PhoneList', () => {
  let component: PhoneList;
  let fixture: ComponentFixture<PhoneList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhoneList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
