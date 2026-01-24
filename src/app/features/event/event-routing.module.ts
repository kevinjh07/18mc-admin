import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LayoutComponent } from "src/app/shared/layout/layout.component";
import { EventListComponent } from "./event-list/event-list.component";
import { EventRegistrationComponent } from "./event-registration/event-registration.component";

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [{ path: "", component: EventListComponent }],
  },
  {
    path: "register",
    component: LayoutComponent,
    children: [{ path: "", component: EventRegistrationComponent }],
  },
  {
    path: "edit/:id",
    component: LayoutComponent,
    children: [{ path: "", component: EventRegistrationComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule {}
