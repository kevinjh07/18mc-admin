import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { EventRoutingModule } from "./event-routing.module";
import { EventListComponent } from "./event-list/event-list.component";
import { EventRegistrationComponent } from "./event-registration/event-registration.component";
import { SharedModule } from "src/app/shared/shared.module";
import { AngularDualListBoxModule } from "angular-dual-listbox";
import { EventParticipantDialogComponent } from './event-participant-dialog/event-participant-dialog.component';

@NgModule({
  declarations: [EventListComponent, EventRegistrationComponent, EventParticipantDialogComponent],
  imports: [CommonModule, EventRoutingModule, SharedModule, AngularDualListBoxModule],
})
export class EventModule {}
