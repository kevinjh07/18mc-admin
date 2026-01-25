import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthGuard } from "./core/guards/auth.guard";

const appRoutes: Routes = [
  {
    path: "auth",
    loadChildren: () => import("./features/auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "user",
    loadChildren: () => import("./features/users/users.module").then((m) => m.UsersModule),
    canActivate: [AuthGuard],
  },
  {
    path: "dashboard",
    loadChildren: () => import("./features/dashboard/dashboard.module").then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
  },
  {
    path: "report",
    loadChildren: () => import("./features/report/report.module").then((m) => m.ReportModule),
    canActivate: [AuthGuard],
  },
  {
    path: "regional",
    loadChildren: () => import("./features/regional/regional.module").then((m) => m.RegionalModule),
    canActivate: [AuthGuard],
  },
  {
    path: "division",
    loadChildren: () => import("./features/division/division.module").then((m) => m.DivisionModule),
    canActivate: [AuthGuard],
  },
  {
    path: "person",
    loadChildren: () => import("./features/person/person.module").then((m) => m.PersonModule),
    canActivate: [AuthGuard],
  },
  {
    path: "social-action",
    loadChildren: () => import("./features/social-action/social-action.module").then((m) => m.SocialActionModule),
    canActivate: [AuthGuard],
  },
  {
    path: "event",
    loadChildren: () => import("./features/event/event.module").then((m) => m.EventModule),
    canActivate: [AuthGuard],
  },
  {
    path: "poll",
    loadChildren: () => import("./features/poll/poll.module").then((m) => m.PollModule),
    canActivate: [AuthGuard],
  },
  {
    path: "",
    redirectTo: "social-action",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "social-action",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
