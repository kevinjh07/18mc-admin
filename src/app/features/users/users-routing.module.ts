import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LayoutComponent } from "src/app/shared/layout/layout.component";

import { UserListComponent } from "./user-list/user-list.component";
import { UserRegistrationComponent } from "./user-registration/user-registration.component";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [{ path: "", component: UserListComponent }],
  },
  {
    path: "register",
    component: LayoutComponent,
    children: [{ path: "", component: UserRegistrationComponent }],
  },
  {
    path: "edit/:id",
    component: LayoutComponent,
    children: [{ path: "", component: UserRegistrationComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
