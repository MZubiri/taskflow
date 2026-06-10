import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.obtenerRol() === 'ADMIN') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
