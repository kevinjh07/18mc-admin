import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LayoutComponent } from "src/app/shared/layout/layout.component";
import { DivisionListComponent } from "./division-list/division-list.component";
import { DivisionRegistrationComponent } from "./division-registration/division-registration.component";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [{ path: "", component: DivisionListComponent }],
  },
  {
    path: "register",
    component: LayoutComponent,
    children: [{ path: "", component: DivisionRegistrationComponent }],
  },
  {
    path: "edit/:id",
    component: LayoutComponent,
    children: [{ path: "", component: DivisionRegistrationComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DivisionRoutingModule {}
