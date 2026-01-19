import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ClassesRoutingModule } from "./classes-routing.module";
import { ClassListComponent } from "./class-list/class-list.component";
import { SharedModule } from "src/app/shared/shared.module";
import { ClassRegistrationComponent } from './class-registration/class-registration.component';

@NgModule({
  declarations: [ClassListComponent, ClassRegistrationComponent],
  imports: [CommonModule, ClassesRoutingModule, SharedModule],
})
export class ClassesModule {}
