import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionRegistrationComponent } from './division-registration.component';

describe('DivisionRegistrationComponent', () => {
  let component: DivisionRegistrationComponent;
  let fixture: ComponentFixture<DivisionRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DivisionRegistrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DivisionRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
