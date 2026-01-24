import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventParticipantDialogComponent } from './event-participant-dialog.component';

describe('EventParticipantDialogComponent', () => {
  let component: EventParticipantDialogComponent;
  let fixture: ComponentFixture<EventParticipantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventParticipantDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventParticipantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
