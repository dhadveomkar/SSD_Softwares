import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionServiceComponent } from './session-service.component';

describe('SessionServiceComponent', () => {
  let component: SessionServiceComponent;
  let fixture: ComponentFixture<SessionServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionServiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SessionServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
