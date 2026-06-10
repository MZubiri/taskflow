import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="card auth-card">
        <div class="auth-header">
          <h2>TaskFlow</h2>
          <p>Crea tu cuenta en la plataforma</p>
        </div>

        @if (error) {
          <div class="alert alert-danger">
            <span>{{ error }}</span>
          </div>
        }

        @if (success) {
          <div class="alert alert-success">
            <span>{{ success }}</span>
          </div>
        }

        <form (ngSubmit)="onRegister()">
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

          <div class="form-group">
            <label class="form-label" for="rol">Rol corporativo (Modo pruebas)</label>
            <select 
              id="rol" 
              name="rol" 
              class="form-control" 
              [(ngModel)]="rol" 
              required
            >
              <option value="USER">Colaborador (USER)</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary w-full" [disabled]="loading || success">
            @if (loading) {
              Registrando usuario...
            } @else {
              Registrarse
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a></p>
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
export class RegisterComponent {
  username = '';
  password = '';
  rol = 'USER';
  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (!this.username || !this.password || !this.rol) {
      this.error = 'Por favor complete todos los campos.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.registrar(this.username, this.password, this.rol).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Usuario registrado exitosamente. Redirigiendo a inicio de sesión...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error', err);
        if (err.status === 400) {
          this.error = 'El nombre de usuario ya está registrado o el formato es inválido.';
        } else {
          this.error = 'Ocurrió un error al registrar el usuario. Intente de nuevo.';
        }
      }
    });
  }
}
