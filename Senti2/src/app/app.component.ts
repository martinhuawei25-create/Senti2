import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthApiService } from './core/services/auth-api.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showHeaderFooter = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authApi: AuthApiService,
    public notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHeaderFooter = event.url !== '/login' && !event.url.startsWith('/auth/callback');
    });
  }

  async ngOnInit() {
    this.notificationService.listChanges.subscribe(() => this.cdr.markForCheck());
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refresh_token'];
      
      if (token) {
        this.authApi.handleAuthCallback(token, refreshToken);
      }
    });
  }
}
