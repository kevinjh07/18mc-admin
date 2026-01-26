import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userName: string = '';

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    const user: any = this.authService.getCurrentUser();
    this.userName = user?.name || user?.fullName || user?.given_name || 'Usuário';
  }
}
