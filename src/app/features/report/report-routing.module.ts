import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportListComponent } from './report-list/report-list.component';
import { GraduationReportComponent } from './graduation-report/graduation-report.component';
import { LayoutComponent } from 'src/app/shared/layout/layout.component';

const routes: Routes = [
  {
      path: "",
      component: LayoutComponent,
      children: [
        { path: "", component: ReportListComponent },
        { path: "graduation", component: GraduationReportComponent }
      ],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
