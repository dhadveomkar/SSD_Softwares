import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerAttandancePageComponent } from './manager-attandance-page.component';

describe('ManagerAttandancePageComponent', () => {
  let component: ManagerAttandancePageComponent;
  let fixture: ComponentFixture<ManagerAttandancePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerAttandancePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManagerAttandancePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
