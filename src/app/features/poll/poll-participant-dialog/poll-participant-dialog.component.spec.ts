import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollParticipantDialogComponent } from './poll-participant-dialog.component';

describe('PollParticipantDialogComponent', () => {
  let component: PollParticipantDialogComponent;
  let fixture: ComponentFixture<PollParticipantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PollParticipantDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PollParticipantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
