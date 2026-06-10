import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="card auth-card">
        <div class="auth-header">
          <h2>TaskFlow</h2>
          <p>Inicia sesión en tu cuenta corporativa</p>
        </div>

        @if (error) {
          <div class="alert alert-danger">
            <span>{{ error }}</span>
          </div>
        }

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label class="form-label" for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              class="form-control" 
              [(ngModel)]="username" 
              required 
              placeholder="nombre.apellido"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-control" 
              [(ngModel)]="password" 
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loading">
            @if (loading) {
              Iniciando sesión...
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: var(--bg-main);
      padding: 1.5rem;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .auth-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.25rem;
    }
    .auth-header p {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
    }
    .w-full {
      width: 100%;
      padding: 0.75rem;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.error = 'Por favor complete todos los campos.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error', err);
        if (err.status === 401) {
          this.error = 'Usuario o contraseña incorrectos.';
        } else {
          this.error = 'Ocurrió un error en el servidor. Intente nuevamente.';
        }
      }
    });
  }
}
