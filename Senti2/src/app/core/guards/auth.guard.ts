import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  const token = authApi.getToken();

  const redirectUrl = state.url.startsWith('/login') ? '/inicio' : state.url;

  if (!token) {
    router.navigate(['/login'], { queryParams: { redirect: redirectUrl } });
    return false;
  }

  if (authApi.getCurrentUserValue()) {
    return true;
  }

  const user = await authApi.verifyToken(token);

  if (user) {
    return true;
  }
  if (authApi.getToken()) {
    return true;
  }
  router.navigate(['/login'], { queryParams: { redirect: redirectUrl } });
  return false;
};
