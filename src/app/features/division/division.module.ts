import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DivisionRoutingModule } from "./division-routing.module";
import { DivisionListComponent } from "./division-list/division-list.component";
import { DivisionRegistrationComponent } from "./division-registration/division-registration.component";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [DivisionListComponent, DivisionRegistrationComponent],
  imports: [CommonModule, DivisionRoutingModule, SharedModule],
})
export class DivisionModule {}
