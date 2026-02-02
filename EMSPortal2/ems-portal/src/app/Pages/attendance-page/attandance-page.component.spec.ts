import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttandancePageComponent } from './attandance-page.component';

describe('AttandancePageComponent', () => {
  let component: AttandancePageComponent;
  let fixture: ComponentFixture<AttandancePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttandancePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttandancePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
