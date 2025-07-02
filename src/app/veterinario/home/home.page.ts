import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, IonItemSliding } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

interface DatoProfesional {
  firma_png: string;
  foto_perfil: string;
}

interface Veterinario {
  nombre_vet: string;
  apellidos_vet: string;
  run_vet: string;
  estado_solicitud: string | null;
  dato_profesional: DatoProfesional;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, ReactiveFormsModule, CommonModule, HeaderComponent]
})
export class HomePage implements OnInit {

  @ViewChild('slidingItem') slidingItem!: IonItemSliding;

  supabase: SupabaseService = inject(SupabaseService);
  router = inject(Router);

  nombreVet = '';
  apellidosVet = '';
  runVet = '';
  logoVet = '';

  estadoSolicitud: string | null = null;
  mostrarMensajeSolicitud = false;

  // Variables para manejar el estado de los ítems deslizados
  slidingOpen = false;
  slidingOpenAgenda = false;
  slidingOpenConsulta = false;
  slidingOpenRecetas = false;
  slidingOpenEstadisticas = false;

  formatRut(rut: string): string {
    rut = String(rut).replace(/^0+|[^0-9kK]+/g, '').toUpperCase();

    if (rut.length < 2) return rut;
    const dv = rut.slice(-1);
    let rutBody = rut.slice(0, -1);

    let reversed = rutBody.split('').reverse().join('');
    let formatted = '';
    for (let i = 0; i < reversed.length; i++) {
      formatted += reversed[i];
      if ((i + 1) % 3 === 0 && i + 1 !== reversed.length) {
        formatted += '.';
      }
    }

    formatted = formatted.split('').reverse().join('');

    return `${formatted}-${dv}`;
  }

  async ngOnInit() {
    const { data: { user }, error } = await this.supabase.auth.getUser();

    if (error) {
      console.error('Error al obtener el usuario:', error);
      return;
    }

    if (!user) {
      console.warn('No se encontró un usuario autenticado.');
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('veterinario')
        .select(`
          nombre_vet, 
          apellidos_vet, 
          run_vet, 
          estado_solicitud,
          dato_profesional (
            firma_png,
            foto_perfil
          )
        `)
        .eq('id_auth', user.id)
        .single();

      if (error) {
        console.error('Error al obtener los datos del veterinario:', error);
        return;
      }

      if (data) {
        this.nombreVet = `${data.nombre_vet} ${data.apellidos_vet}`;
        this.runVet = this.formatRut(data?.run_vet || '');
        this.logoVet = (data.dato_profesional as any)?.foto_perfil || 'assets/default-user.png';
        this.estadoSolicitud = data.estado_solicitud;
        this.mostrarMensajeSolicitud = true;
      } else {
        console.warn('No se encontraron datos para este veterinario.');
      }
    } catch (error) {
      console.error('Error en la consulta a Supabase:', error);
    }
  }

  cerrarMensajeSolicitud() {
    this.mostrarMensajeSolicitud = false;
  }

  onSlideOpen() {
    this.slidingOpen = true;
  }

  onSlideClose() {
    this.slidingOpen = false;
  }

  irATutor() {
    if (this.estadoSolicitud === 'aceptada') {
      this.router.navigate(['/tutor']);
      this.slidingItem.close();
      this.slidingOpen = false;
    }
  }

  irAAgenda() {
    if (this.estadoSolicitud === 'aceptada') {
      this.router.navigate(['/agenda']);
    }
  }

  irAConsulta() {
    if (this.estadoSolicitud === 'aceptada') {
      this.router.navigate(['/atencion-medica']);
    }
  }

  irARecetas() {
    if (this.estadoSolicitud === 'aceptada') {
      this.router.navigate(['/recetas']);
    }
  }
}
