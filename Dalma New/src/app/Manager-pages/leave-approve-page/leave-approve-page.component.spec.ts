import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveApprovePageComponent } from './leave-approve-page.component';

// ✅ Mock sessionStorage to avoid "ReferenceError: sessionStorage is not defined"
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: (key: string) => {
      if (key === 'EmpId') return 'mockEmpId123'; // replace with expected test value
      return null;
    },
    setItem: () => null,
    removeItem: () => null,
    clear: () => null
  },
  writable: true
});

describe('LeaveApprovePageComponent', () => {
  let component: LeaveApprovePageComponent;
  let fixture: ComponentFixture<LeaveApprovePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveApprovePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeaveApprovePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
