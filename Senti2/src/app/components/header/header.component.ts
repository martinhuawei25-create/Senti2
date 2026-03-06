import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { from, Subscription } from 'rxjs';
import { switchMap, catchError, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  displayName = 'Mi Perfil';
  userEmail = '';
  private subs: Subscription[] = [];

  constructor(
    public supabase: SupabaseService
  ) { }

  ngOnInit() {
    const userName$ = this.supabase.currentUser$.pipe(
      switchMap((user) => {
        if (user) {
          return from(this.supabase.getUserDisplayName(user.id)).pipe(
            catchError(() => of(user.email || 'Mi Perfil'))
          );
        }
        return of('Login');
      }),
      shareReplay(1)
    );

    this.subs.push(
      this.supabase.currentUser$.subscribe((user) => {
        this.isAuthenticated = !!user;
        this.userEmail = user?.email || '';
      })
    );
    this.subs.push(
      userName$.subscribe((name) => { this.displayName = name; })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
