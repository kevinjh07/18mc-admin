import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";

import { PersonRoutingModule } from "./person-routing.module";
import { PersonListComponent } from "./person-list/person-list.component";
import { PersonRegistrationComponent } from "./person-registration/person-registration.component";
import { SharedModule } from "src/app/shared/shared.module";
import { PersonLatePaymentDialogComponent } from './person-late-payment-dialog/person-late-payment-dialog.component';

@NgModule({
  declarations: [PersonListComponent, PersonRegistrationComponent, PersonLatePaymentDialogComponent],
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
