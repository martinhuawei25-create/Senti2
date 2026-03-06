import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { Router } from '@angular/router';

interface UserProfile {
  id?: string;
  user_id: string;
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  profile: UserProfile = {
    user_id: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    fecha_nacimiento: ''
  };
  private originalProfile: UserProfile | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  userEmail = '';
  editMode = false;
  displayName = '';
  userMetadata: any = {};

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.userEmail = user.email || '';
      this.profile.user_id = user.id;
      this.userMetadata = user.user_metadata || {};
      this.displayName = await this.supabase.getUserDisplayName(user.id);

      const existingProfile = await this.supabase.getUserProfile(user.id);
      if (existingProfile) {
        this.profile = existingProfile;
        this.profile.fecha_nacimiento = this.toDateInputValue(this.profile.fecha_nacimiento);
      } else {
        this.profile.user_id = user.id;
      }

      this.mergeAccountInfoIntoProfile();
      this.originalProfile = this.cloneProfile(this.profile);
    } catch (error: any) {
      this.errorMessage = 'Error al cargar el perfil: ' + (error.message || 'Error desconocido');
    } finally {
      this.loading = false;
    }
  }

  toggleEditMode() {
    if (!this.editMode) {
      this.originalProfile = this.cloneProfile(this.profile);
      this.mergeAccountInfoIntoProfile();
      this.editMode = true;
    } else {
      this.cancelEdit();
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    if (this.originalProfile) {
      this.profile = this.cloneProfile(this.originalProfile);
    }
    this.editMode = false;
  }

  async saveProfile() {
    if (!this.profile.user_id) {
      this.errorMessage = 'No se pudo identificar al usuario';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const updatedProfile = await this.supabase.updateUserProfile(this.profile);
      if (updatedProfile) {
        this.profile = updatedProfile;
        this.profile.fecha_nacimiento = this.toDateInputValue(this.profile.fecha_nacimiento);
        this.originalProfile = this.cloneProfile(this.profile);
        this.successMessage = 'Perfil actualizado correctamente';
        this.editMode = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }
    } catch (error: any) {
      this.errorMessage = 'Error al guardar el perfil: ' + (error.message || 'Error desconocido');
    } finally {
      this.saving = false;
    }
  }

  async logout() {
    await this.supabase.signOut();
  }

  getInitials(): string {
    const givenName = this.userMetadata['given_name'] as string;
    const familyName = this.userMetadata['family_name'] as string;
    if (givenName && familyName) {
      return (givenName[0] + familyName[0]).toUpperCase();
    } else if (givenName) {
      return givenName.substring(0, 2).toUpperCase();
    }
    
    const nombre = this.profile.nombre || '';
    const apellidos = this.profile.apellidos || '';
    if (nombre && apellidos) {
      return (nombre[0] + apellidos[0]).toUpperCase();
    } else if (nombre) {
      return nombre.substring(0, 2).toUpperCase();
    } else if (this.userEmail) {
      return this.userEmail.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getDisplayName(): string {
    if (this.displayName && this.displayName !== 'Mi Perfil') {
      return this.displayName;
    }
    
    if (this.profile.nombre && this.profile.apellidos) {
      return `${this.profile.nombre} ${this.profile.apellidos}`;
    } else if (this.profile.nombre) {
      return this.profile.nombre;
    }
    
    return this.userEmail || 'Usuario';
  }

  getFullName(): string {
    const fullName = this.userMetadata['full_name'] as string;
    if (fullName) {
      return fullName;
    }
    
    const givenName = this.userMetadata['given_name'] as string;
    const familyName = this.userMetadata['family_name'] as string;
    if (givenName || familyName) {
      return [givenName, familyName].filter(Boolean).join(' ');
    }
    
    if (this.profile.nombre && this.profile.apellidos) {
      return `${this.profile.nombre} ${this.profile.apellidos}`;
    } else if (this.profile.nombre) {
      return this.profile.nombre;
    }
    return '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  private cloneProfile(p: UserProfile): UserProfile {
    return JSON.parse(JSON.stringify(p)) as UserProfile;
  }

  private toDateInputValue(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }

  private mergeAccountInfoIntoProfile(): void {
    const metadata = this.userMetadata || {};

    const fullName = (metadata['full_name'] as string) || '';
    const givenName = (metadata['given_name'] as string) || '';
    const familyName = (metadata['family_name'] as string) || '';
    const displayName = (this.displayName as string) || '';
    const displayNameLooksLikeEmail = displayName.includes('@');
    const fallbackNameSource =
      fullName ||
      (!displayNameLooksLikeEmail ? displayName : '');

    if ((!this.profile.nombre || !this.profile.nombre.trim()) && (givenName || fullName)) {
      this.profile.nombre = givenName || this.splitName(fullName).nombre;
    }
    if ((!this.profile.apellidos || !this.profile.apellidos.trim()) && (familyName || fullName)) {
      this.profile.apellidos = familyName || this.splitName(fullName).apellidos;
    }

    if (
      (!this.profile.nombre || !this.profile.nombre.trim() || !this.profile.apellidos || !this.profile.apellidos.trim()) &&
      fallbackNameSource
    ) {
      const split = this.splitName(fallbackNameSource);
      if (!this.profile.nombre || !this.profile.nombre.trim()) this.profile.nombre = split.nombre;
      if (!this.profile.apellidos || !this.profile.apellidos.trim()) this.profile.apellidos = split.apellidos;
    }

    const phone =
      (metadata['phone'] as string) ||
      (metadata['telefono'] as string) ||
      (metadata['phone_number'] as string) ||
      '';
    if ((!this.profile.telefono || !this.profile.telefono.trim()) && phone) {
      this.profile.telefono = phone;
    }

    const birth =
      (metadata['birthdate'] as string) ||
      (metadata['fecha_nacimiento'] as string) ||
      '';
    if ((!this.profile.fecha_nacimiento || !this.profile.fecha_nacimiento.trim()) && birth) {
      this.profile.fecha_nacimiento = this.toDateInputValue(birth);
    }
  }

  private splitName(fullName: string): { nombre: string; apellidos: string } {
    const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return { nombre: parts[0] ?? '', apellidos: '' };
    return { nombre: parts[0], apellidos: parts.slice(1).join(' ') };
  }
}
