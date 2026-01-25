import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Directive({
  standalone: false,
  selector: '[role]',
})
export class RoleDirective implements OnInit {
  @Input() role: string[];
  element: ElementRef;

  constructor(element: ElementRef, private authService: AuthenticationService) {
    this.element = element;
  }

  ngOnInit(): void {
    if (!this.authService.roleMatch(this.role)) {
      this.element.nativeElement.style.display = 'none';
    }
  }
}

