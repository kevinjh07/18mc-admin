import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LayoutComponent } from "src/app/shared/layout/layout.component";
import { PollListComponent } from "./poll-list/poll-list.component";
import { PollRegistrationComponent } from "./poll-registration/poll-registration.component";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [{ path: "", component: PollListComponent }],
  },
  {
    path: "register",
    component: LayoutComponent,
    children: [{ path: "", component: PollRegistrationComponent }],
  },
  {
    path: "edit/:id",
    component: LayoutComponent,
    children: [{ path: "", component: PollRegistrationComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PollRoutingModule {}
