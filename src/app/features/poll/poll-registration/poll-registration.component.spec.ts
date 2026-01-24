import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollRegistrationComponent } from './poll-registration.component';

describe('PollRegistrationComponent', () => {
  let component: PollRegistrationComponent;
  let fixture: ComponentFixture<PollRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PollRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
