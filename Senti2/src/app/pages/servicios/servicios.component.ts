import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent {
  constructor(
    private router: Router,
    private authApi: AuthApiService
  ) {}

  goTo(path: string): void {
    if (this.authApi.getCurrentUserValue()) {
      this.router.navigateByUrl(path);
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: path } });
    }
  }
}

