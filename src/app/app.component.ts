import { Component } from "@angular/core";

@Component({
    standalone: false,
  selector: "app-root",
  template: `<block-ui><router-outlet></router-outlet></block-ui>`,
})
export class AppComponent {}

