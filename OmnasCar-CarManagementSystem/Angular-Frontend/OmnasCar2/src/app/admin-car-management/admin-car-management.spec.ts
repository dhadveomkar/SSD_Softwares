import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCarManagement } from './admin-car-management';

describe('AdminCarManagement', () => {
  let component: AdminCarManagement;
  let fixture: ComponentFixture<AdminCarManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCarManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCarManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
