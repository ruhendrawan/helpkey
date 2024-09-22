import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableAccessibilityComponent } from './enable-accessibility.component';

describe('EnableAccessibilityComponent', () => {
  let component: EnableAccessibilityComponent;
  let fixture: ComponentFixture<EnableAccessibilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnableAccessibilityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EnableAccessibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
