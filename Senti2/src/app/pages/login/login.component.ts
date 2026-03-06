import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthApiService } from '../../core/services/auth-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  isRegisterMode = false;
  isProcessingCallback = false;

  constructor(
    private supabase: SupabaseService,
    private authApi: AuthApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    if (this.authApi.getToken()) {
      this.router.navigateByUrl(this.getRedirectUrl());
      return;
    }

    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const isCallbackRoute = typeof window !== 'undefined' && window.location.pathname.includes('auth/callback');

    if (hash && isCallbackRoute) {
      this.isProcessingCallback = true;
    }

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const errorDesc = params.get('error_description') || params.get('error');
      if (errorDesc) {
        this.isProcessingCallback = false;
        this.errorMessage = decodeURIComponent(errorDesc);
        this.loading = false;
        this.replaceStateWithoutHash();
        return;
      }
      if (accessToken) {
        const redirect = this.getRedirectUrl();
        this.authApi.handleAuthCallback(accessToken, refreshToken ?? undefined, redirect);
        this.replaceStateWithoutHash();
        return;
      }
      this.isProcessingCallback = false;
    }

    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refresh_token'];
      const error = params['error'];

      if (error) {
        this.errorMessage = decodeURIComponent(error);
        this.loading = false;
      }

      if (token) {
        const redirect = this.getRedirectUrl();
        this.authApi.handleAuthCallback(token, refreshToken, redirect);
      }
    });
  }

  private getRedirectUrl(): string {
    const fromQuery = this.route.snapshot.queryParams['redirect'];
    if (fromQuery && typeof fromQuery === 'string' && fromQuery.startsWith('/')) {
      return fromQuery;
    }
    const fromStorage = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('login_redirect') : null;
    if (fromStorage) {
      sessionStorage.removeItem('login_redirect');
      return fromStorage;
    }
    return '/inicio';
  }

  private replaceStateWithoutHash(): void {
    if (typeof window !== 'undefined' && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { data, error } = await this.supabase.signIn(this.email, this.password);
      if (error) throw error;
      const redirect = this.route.snapshot.queryParams['redirect'];
      this.router.navigateByUrl(redirect && redirect.startsWith('/') ? redirect : '/inicio');
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
    } finally {
      this.loading = false;
    }
  }

  async onRegister() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { data, error } = await this.supabase.signUp(this.email, this.password);
      if (error) throw error;
      this.successMessage = '¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al registrarse. Por favor, intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    const redirect = this.route.snapshot.queryParams['redirect'];
    if (redirect && redirect.startsWith('/') && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('login_redirect', redirect);
    }
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { error } = await this.supabase.signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesión con Google. Por favor, intenta de nuevo.';
      this.loading = false;
    }
  }
}
