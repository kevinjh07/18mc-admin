import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RegionalRoutingModule } from "./regional-routing.module";
import { RegionalListComponent } from "./regional-list/regional-list.component";
import { RegionalRegistrationComponent } from "./regional-registration/regional-registration.component";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  declarations: [RegionalListComponent, RegionalRegistrationComponent],
  imports: [CommonModule, RegionalRoutingModule, SharedModule],
})
export class RegionalModule {}
