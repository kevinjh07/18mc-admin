import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialActionRegistrationComponent } from './social-action-registration.component';

describe('SocialActionRegistrationComponent', () => {
  let component: SocialActionRegistrationComponent;
  let fixture: ComponentFixture<SocialActionRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialActionRegistrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialActionRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
