import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PollRoutingModule } from "./poll-routing.module";
import { PollListComponent } from "./poll-list/poll-list.component";
import { PollRegistrationComponent } from "./poll-registration/poll-registration.component";
import { SharedModule } from "src/app/shared/shared.module";
import { AngularDualListBoxModule } from "angular-dual-listbox";
import { PollParticipantDialogComponent } from './poll-participant-dialog/poll-participant-dialog.component';

@NgModule({
  declarations: [PollListComponent, PollRegistrationComponent, PollParticipantDialogComponent],
  imports: [CommonModule, PollRoutingModule, SharedModule, AngularDualListBoxModule],
})
export class PollModule {}
