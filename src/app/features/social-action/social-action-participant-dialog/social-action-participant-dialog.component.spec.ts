import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialActionParticipantDialogComponent } from './social-action-participant-dialog.component';

describe('SocialActionParticipantDialogComponent', () => {
  let component: SocialActionParticipantDialogComponent;
  let fixture: ComponentFixture<SocialActionParticipantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialActionParticipantDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialActionParticipantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
