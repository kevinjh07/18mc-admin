import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { ReportListComponent } from './report-list/report-list.component';
import { GraduationReportComponent } from './graduation-report/graduation-report.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    ReportListComponent,
    GraduationReportComponent
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    MatExpansionModule,
    SharedModule,
  ]
})
export class ReportModule { }
