import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FlexLayoutModule } from "@ngbracket/ngx-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CustomMaterialModule } from "../custom-material/custom-material.module";
import { LimitToPipe } from "./pipes/limit-to.pipe";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { ContentPlaceholderAnimationComponent } from "./content-placeholder-animation/content-placeholder-animation.component";
import { LocalDatePipe } from "./pipes/local-date.pipe";
import { YesNoPipe } from "./pipes/yes-no.pipe";
import { LayoutComponent } from "./layout/layout.component";
import { JoinPipe } from "./pipes/join.pipe";
import { RoleDirective } from "./directives/role.directive";

@NgModule({
  imports: [RouterModule, CustomMaterialModule, FormsModule, ReactiveFormsModule, FlexLayoutModule],
  declarations: [
    ConfirmDialogComponent,
    ContentPlaceholderAnimationComponent,
    LimitToPipe,
    LocalDatePipe,
    YesNoPipe,
    LayoutComponent,
    JoinPipe,
    RoleDirective,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CustomMaterialModule,
    LimitToPipe,
    ConfirmDialogComponent,
    ContentPlaceholderAnimationComponent,
    LocalDatePipe,
    YesNoPipe,
    JoinPipe,
  ],
})
export class SharedModule {}
