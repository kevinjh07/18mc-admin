import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

import { PersonRoutingModule } from "./person-routing.module";
import { PersonListComponent } from "./person-list/person-list.component";
import { PersonRegistrationComponent } from "./person-registration/person-registration.component";
import { SharedModule } from "src/app/shared/shared.module";
import { PersonPaymentDialogComponent } from './person-payment-dialog/person-payment-dialog.component';

@NgModule({
  declarations: [PersonListComponent, PersonRegistrationComponent, PersonPaymentDialogComponent],
  imports: [
    CommonModule,
    PersonRoutingModule,
    SharedModule,
    MatTableModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
})
export class PersonModule {}
