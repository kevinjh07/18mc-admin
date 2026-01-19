import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LayoutComponent } from "src/app/shared/layout/layout.component";
import { SocialActionListComponent } from "./social-action-list/social-action-list.component";
import { SocialActionRegistrationComponent } from "./social-action-registration/social-action-registration.component";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [{ path: "", component: SocialActionListComponent }],
  },
  {
    path: "register",
    component: LayoutComponent,
    children: [{ path: "", component: SocialActionRegistrationComponent }],
  },
  {
    path: "edit/:id",
    component: LayoutComponent,
    children: [{ path: "", component: SocialActionRegistrationComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SocialActionRoutingModule {}
