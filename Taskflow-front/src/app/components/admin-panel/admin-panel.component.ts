import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TareaService, TareaResponse, TareaRequest } from '../../services/tarea.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, DatePipe],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="logo-text">TaskFlow</span>
        </div>
        
        <div class="user-profile">
          <div class="avatar admin-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="username">{{ username }}</span>
            <span class="role-badge badge-admin">Administrador</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            Mis Tareas
          </a>
          <a routerLink="/admin" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Panel Admin
          </a>
        </nav>

        <div class="sidebar-footer">
          <button (click)="onLogout()" class="btn btn-logout">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <header class="content-header">
          <div>
            <h1>Consola de Administración</h1>
            <p class="subtitle">Supervisión y control global de tareas de la organización</p>
          </div>
          <button (click)="openCreateModal()" class="btn btn-primary">
            + Crear Tarea Administrador
          </button>
        </header>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="card stat-card admin-stat">
            <div class="stat-title">Total Tareas Globales</div>
            <div class="stat-value">{{ totalTareas }}</div>
          </div>
          <div class="card stat-card border-pending">
            <div class="stat-title">Pendientes</div>
            <div class="stat-value text-pending">{{ pendientesCount }}</div>
          </div>
          <div class="card stat-card border-progress">
            <div class="stat-title">En Progreso</div>
            <div class="stat-value text-progress">{{ progresoCount }}</div>
          </div>
          <div class="card stat-card border-completed">
            <div class="stat-title">Completadas</div>
            <div class="stat-value text-completed">{{ completadasCount }}</div>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="card filter-card">
          <div class="filter-controls">
            <div class="search-box">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar en base de datos global..." 
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterTareas()"
              />
            </div>
            <div class="status-filter">
              <select class="form-control" [(ngModel)]="statusFilter" (ngModelChange)="filterTareas()">
                <option value="ALL">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="COMPLETADO">Completado</option>
              </select>
            </div>
          </div>
        </div>

        @if (error) {
          <div class="alert alert-danger">
            <span>{{ error }}</span>
            <button class="btn-close" (click)="error = ''">×</button>
          </div>
        }

        @if (success) {
          <div class="alert alert-success">
            <span>{{ success }}</span>
            <button class="btn-close" (click)="success = ''">×</button>
          </div>
        }

        <!-- Table Card -->
        <div class="card table-card-container">
          <div class="table-header-admin">
            <h4>Listado de Tareas (Acceso Total)</h4>
            <span class="badge badge-admin-info">Modo Lectura/Escritura</span>
          </div>

          @if (loading) {
            <div class="loading-state">Cargando tareas del sistema...</div>
          } @else if (filteredTareas.length === 0) {
            <div class="empty-state">
              <p>No se encontraron tareas globales registradas.</p>
            </div>
          } @else {
            <div class="table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Asignada A</th>
                    <th>Estado (Editable inline)</th>
                    <th>Creado</th>
                    <th>Actualizado</th>
                    <th>Acciones Admin</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of filteredTareas; track t.id) {
                    <tr>
                      <td class="cell-id">#{{ t.id }}</td>
                      <td class="cell-title">{{ t.titulo }}</td>
                      <td class="cell-desc">{{ t.descripcion }}</td>
                      <td class="cell-id">Usuario #{{ t.usuarioId }}</td>
                      <td>
                        <select 
                          [ngModel]="t.estado" 
                          (ngModelChange)="onStatusChange(t, $event)"
                          [class]="getStatusSelectClass(t.estado)"
                          class="status-select-inline"
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_PROGRESO">En Progreso</option>
                          <option value="COMPLETADO">Completado</option>
                        </select>
                      </td>
                      <td>{{ t.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td>{{ t.fechaActualizacion | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="actions-cell">
                        <button (click)="openEditModal(t)" class="btn-icon btn-edit" title="Modificar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button (click)="openDeleteModal(t.id)" class="btn-icon btn-delete" title="Eliminar (Forzado)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </main>
    </div>

    <!-- Modal Form (Create / Edit) -->
    @if (showModal) {
      <div class="modal-backdrop">
        <div class="card modal-card">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Modificar Tarea (Administración)' : 'Nueva Tarea (Administración)' }}</h3>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>
          <form (ngSubmit)="saveTarea()">
            <div class="form-group">
              <label class="form-label" for="task-title">Título</label>
              <input 
                type="text" 
                id="task-title" 
                name="titulo" 
                class="form-control" 
                [(ngModel)]="taskForm.titulo" 
                required
                placeholder="Título de la tarea"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label" for="task-desc">Descripción</label>
              <textarea 
                id="task-desc" 
                name="descripcion" 
                class="form-control" 
                rows="4"
                [(ngModel)]="taskForm.descripcion" 
                required
                placeholder="Descripción detallada de la tarea..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="task-status">Estado</label>
              <select 
                id="task-status" 
                name="estado" 
                class="form-control" 
                [(ngModel)]="taskForm.estado" 
                required
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="COMPLETADO">Completado</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="task-user-id">ID Usuario Asignado (Opcional)</label>
              <input 
                type="number" 
                id="task-user-id" 
                name="usuarioId" 
                class="form-control" 
                [(ngModel)]="taskForm.usuarioId" 
                placeholder="Ej. 1 (Dejar vacío para asignártela a ti)"
              />
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Confirmación Eliminar (Custom Admin) -->
    @if (showDeleteModal) {
      <div class="modal-backdrop">
        <div class="card modal-card delete-modal-card">
          <div class="modal-header header-danger">
            <h3>Confirmar Eliminación Administrativa</h3>
            <button class="btn-close" (click)="closeDeleteModal()">×</button>
          </div>
          <div class="modal-body">
            <p>¿Está seguro de que desea eliminar permanentemente esta tarea como Administrador? Esta acción no se puede deshacer y se borrará del sistema de forma definitiva.</p>
          </div>
          <div class="modal-footer">
            <button type="button" (click)="closeDeleteModal()" class="btn btn-secondary" [disabled]="deleting">Cancelar</button>
            <button type="button" (click)="confirmDelete()" class="btn btn-danger" [disabled]="deleting">
              {{ deleting ? 'Eliminando...' : 'Eliminar Tarea' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-main);
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      background-color: var(--bg-sidebar);
      color: var(--text-light);
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: #ffffff;
    }
    .user-profile {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--accent-color);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .admin-avatar {
      background-color: #dc2626; /* Deep Red for Admin in Console */
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .username {
      font-size: 0.875rem;
      font-weight: 500;
      color: #ffffff;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .role-badge {
      font-size: 0.75rem;
      color: var(--text-muted);
      background-color: rgba(255, 255, 255, 0.1);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      margin-top: 0.25rem;
      align-self: flex-start;
      font-weight: 600;
    }
    .badge-admin {
      background-color: #7f1d1d;
      color: #fca5a5;
    }
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.15s, background-color 0.15s;
    }
    .nav-item:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.04);
      text-decoration: none;
    }
    .nav-item.active {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.08);
      border-left: 3px solid #dc2626;
    }
    .nav-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn-logout {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f1f5f9;
      justify-content: flex-start;
      gap: 0.5rem;
    }
    .btn-logout:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
    .content-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .content-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    .subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .stat-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    .admin-stat {
      border-left: 4px solid #dc2626;
    }
    .border-pending { border-left: 4px solid var(--warning-color); }
    .border-progress { border-left: 4px solid var(--accent-color); }
    .border-completed { border-left: 4px solid var(--success-color); }
    .text-pending { color: var(--warning-color); }
    .text-progress { color: var(--accent-color); }
    .text-completed { color: var(--success-color); }

    /* Filters */
    .filter-card {
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .filter-controls {
      display: flex;
      gap: 1rem;
    }
    .search-box {
      flex: 1;
    }
    .status-filter {
      width: 200px;
    }

    /* Table styles & custom */
    .table-card-container {
      padding: 0;
      overflow: hidden;
    }
    .table-header-admin {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff5f5;
    }
    .table-header-admin h4 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #991b1b;
      margin: 0;
    }
    .badge-admin-info {
      background-color: #fee2e2;
      color: #991b1b;
      font-weight: 600;
    }
    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .cell-id {
      font-weight: 600;
      color: var(--text-muted);
    }
    .cell-title {
      font-weight: 500;
      color: var(--primary-color);
    }
    .cell-desc {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-muted);
    }
    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }
    .btn-icon {
      background: none;
      border: none;
      padding: 0.375rem;
      cursor: pointer;
      color: var(--text-muted);
      border-radius: 4px;
      transition: color 0.15s, background-color 0.15s;
      display: inline-flex;
    }
    .btn-icon svg {
      width: 1.125rem;
      height: 1.125rem;
    }
    .btn-edit:hover {
      color: var(--accent-color);
      background-color: #eff6ff;
    }
    .btn-delete:hover {
      color: var(--error-color);
      background-color: #fef2f2;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      color: var(--text-muted);
    }
    .btn-close:hover {
      color: var(--primary-color);
    }

    /* Modals */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(15, 23, 42, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-card {
      width: 100%;
      max-width: 500px;
      margin: 1.5rem;
      animation: modalFadeIn 0.2s ease-out;
    }
    .delete-modal-card {
      max-width: 420px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }
    .modal-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--primary-color);
    }
    .header-danger h3 {
      color: var(--error-color) !important;
    }
    .modal-body {
      padding: 1rem 0;
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  // User profile
  username = '';
  userInitials = '';

  // Task lists
  tareas: TareaResponse[] = [];
  filteredTareas: TareaResponse[] = [];
  loading = true;

  // Search & Filter
  searchQuery = '';
  statusFilter = 'ALL';

  // Stats
  totalTareas = 0;
  pendientesCount = 0;
  progresoCount = 0;
  completadasCount = 0;

  // Alert state
  error = '';
  success = '';

  // Modal form state
  showModal = false;
  isEditMode = false;
  saving = false;
  selectedTaskId: number | null = null;
  taskForm: TareaRequest = {
    titulo: '',
    descripcion: '',
    estado: 'PENDIENTE',
    usuarioId: undefined
  };

  // Custom Delete Modal State
  showDeleteModal = false;
  selectedDeleteTaskId: number | null = null;
  deleting = false;

  constructor(
    private authService: AuthService, 
    private tareaService: TareaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.verifyAdmin();
    this.loadUserProfile();
    this.loadTareas();
  }

  verifyAdmin() {
    if (this.authService.obtenerRol() !== 'ADMIN') {
      this.router.navigate(['/dashboard']);
    }
    this.cdr.detectChanges();
  }

  loadUserProfile() {
    this.username = this.authService.obtenerUsername() || 'Admin';

    // Compute initials
    const parts = this.username.split('.');
    if (parts.length >= 2) {
      this.userInitials = (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    } else {
      this.userInitials = this.username.substring(0, 2).toUpperCase();
    }
    this.cdr.detectChanges();
  }

  loadTareas() {
    this.loading = true;
    this.cdr.detectChanges();

    this.tareaService.listar().subscribe({
      next: (data) => {
        this.tareas = data || [];
        this.filterTareas();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching admin tasks', err);
        this.error = 'No se pudo cargar la base de datos de tareas.';
        this.cdr.detectChanges();
      }
    });
  }

  filterTareas() {
    // Apply filters
    this.filteredTareas = this.tareas.filter(t => {
      const matchSearch = 
        t.titulo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchStatus = 
        this.statusFilter === 'ALL' || 
        t.estado.toUpperCase() === this.statusFilter.toUpperCase();

      return matchSearch && matchStatus;
    });

    // Recalculate stats
    this.totalTareas = this.tareas.length;
    this.pendientesCount = this.tareas.filter(t => t.estado.toUpperCase() === 'PENDIENTE').length;
    this.progresoCount = this.tareas.filter(t => t.estado.toUpperCase() === 'EN_PROGRESO').length;
    this.completadasCount = this.tareas.filter(t => t.estado.toUpperCase() === 'COMPLETADO').length;
    this.cdr.detectChanges();
  }

  getStatusSelectClass(status: string): string {
    const s = status.toUpperCase();
    if (s === 'PENDIENTE') return 'select-pending';
    if (s === 'EN_PROGRESO') return 'select-progress';
    if (s === 'COMPLETADO') return 'select-completed';
    return '';
  }

  getEstadoLabel(status: string): string {
    const s = status.toUpperCase();
    if (s === 'PENDIENTE') return 'Pendiente';
    if (s === 'EN_PROGRESO') return 'En Progreso';
    if (s === 'COMPLETADO') return 'Completado';
    return status;
  }

  onLogout() {
    this.authService.logout();
  }

  // Modal Control
  openCreateModal() {
    this.isEditMode = false;
    this.selectedTaskId = null;
    this.taskForm = {
      titulo: '',
      descripcion: '',
      estado: 'PENDIENTE',
      usuarioId: undefined
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(tarea: TareaResponse) {
    this.isEditMode = true;
    this.selectedTaskId = tarea.id;
    this.taskForm = {
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      estado: tarea.estado,
      usuarioId: tarea.usuarioId
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.saving = false;
    this.cdr.detectChanges();
  }

  saveTarea() {
    if (!this.taskForm.titulo || !this.taskForm.descripcion || !this.taskForm.estado) {
      this.error = 'Por favor complete todos los campos obligatorios.';
      return;
    }
    
    this.saving = true;
    this.error = '';
    this.cdr.detectChanges();
    
    if (this.isEditMode && this.selectedTaskId !== null) {
      this.tareaService.actualizar(this.selectedTaskId, this.taskForm).subscribe({
        next: () => {
          this.success = 'Tarea modificada con éxito por el administrador.';
          this.closeModal();
          this.loadTareas();
          setTimeout(() => {
            this.success = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.saving = false;
          console.error('Error updating task as admin', err);
          this.error = 'Ocurrió un error al actualizar la tarea.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.tareaService.crear(this.taskForm).subscribe({
        next: () => {
          this.success = 'Tarea creada con éxito por el administrador.';
          this.closeModal();
          this.loadTareas();
          setTimeout(() => {
            this.success = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err) => {
          this.saving = false;
          console.error('Error creating task as admin', err);
          this.error = 'Ocurrió un error al crear la tarea.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Inline Status Change (UX improvement)
  onStatusChange(tarea: TareaResponse, newStatus: string) {
    this.error = '';
    this.success = '';
    this.cdr.detectChanges();

    const request: TareaRequest = {
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      estado: newStatus,
      usuarioId: tarea.usuarioId
    };

    this.tareaService.actualizar(tarea.id, request).subscribe({
      next: () => {
        tarea.estado = newStatus;
        this.success = 'Estado de la tarea actualizado con éxito.';
        this.loadTareas(); // reload to recalculate stats and dates
        setTimeout(() => {
          this.success = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error updating status as admin', err);
        this.error = 'No se pudo actualizar el estado de la tarea.';
        this.loadTareas(); // reset selection in UI
      }
    });
  }

  // Custom Delete Modal Control
  openDeleteModal(id: number) {
    this.selectedDeleteTaskId = id;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  closeDeleteModal() {
    this.selectedDeleteTaskId = null;
    this.showDeleteModal = false;
    this.deleting = false;
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (this.selectedDeleteTaskId === null) return;
    this.deleting = true;
    this.error = '';
    this.cdr.detectChanges();

    this.tareaService.eliminar(this.selectedDeleteTaskId).subscribe({
      next: () => {
        this.success = 'Tarea eliminada permanentemente del sistema.';
        this.closeDeleteModal();
        this.loadTareas();
        setTimeout(() => {
          this.success = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.deleting = false;
        console.error('Error deleting task as admin', err);
        this.error = 'No se pudo eliminar la tarea.';
        this.cdr.detectChanges();
      }
    });
  }
}
