import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RegionalListComponent } from "./regional-list/regional-list.component";
import { LayoutComponent } from "src/app/shared/layout/layout.component";
import { RegionalRegistrationComponent } from "./regional-registration/regional-registration.component";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [{ path: "", component: RegionalListComponent }],
  },
  {
    path: "register",
    component: LayoutComponent,
    children: [{ path: "", component: RegionalRegistrationComponent }],
  },
  {
    path: "edit/:id",
    component: LayoutComponent,
    children: [{ path: "", component: RegionalRegistrationComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegionalRoutingModule {}
