import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SocialActionRoutingModule } from "./social-action-routing.module";
import { SocialActionListComponent } from "./social-action-list/social-action-list.component";
import { SocialActionRegistrationComponent } from "./social-action-registration/social-action-registration.component";
import { SharedModule } from "src/app/shared/shared.module";
import { AngularDualListBoxModule } from "angular-dual-listbox";
import { SocialActionParticipantDialogComponent } from './social-action-participant-dialog/social-action-participant-dialog.component';

@NgModule({
  declarations: [SocialActionListComponent, SocialActionRegistrationComponent, SocialActionParticipantDialogComponent],
  imports: [CommonModule, SocialActionRoutingModule, SharedModule, AngularDualListBoxModule],
})
export class SocialActionModule {}
