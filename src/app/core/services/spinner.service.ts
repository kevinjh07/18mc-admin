import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  visibility = new BehaviorSubject(false);

  constructor() {
  }

  show() {
    setTimeout(() => this.visibility.next(true), 0);
  }

  hide() {
    setTimeout(() => this.visibility.next(false), 0);
  }
}
