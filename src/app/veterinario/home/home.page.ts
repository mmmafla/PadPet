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

  estadoSolicitud: string = 'rechazada'; // valor por defecto
  mostrarMensajeSolicitud = true; // ahora siempre visible

  estadosPosibles: { id: string; nombre: string }[] = [];
  estadoNombre: string = 'Desconocido';

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

    if (error || !user) {
      console.error('Error al obtener el usuario:', error);
      return;
    }

    try {
      // 1. Consultar la tabla de estados desde Supabase
      const { data: estados, error: errorEstados } = await this.supabase
        .from('estado_solicitud')
        .select('id_est_solicitud, nombre_solicitud');

      if (errorEstados) {
        console.error('Error al obtener estados:', errorEstados);
        return;
      }

      this.estadosPosibles = estados.map(e => ({
        id: String(e.id_est_solicitud),
        nombre: e.nombre_solicitud
      }));

      // 2. Obtener datos del veterinario
      const { data, error: errorVet } = await this.supabase
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

      if (errorVet) {
        console.error('Error al obtener los datos del veterinario:', errorVet);
        return;
      }

      if (data) {
        this.nombreVet = `${data.nombre_vet} ${data.apellidos_vet}`;
        this.runVet = this.formatRut(data.run_vet || '');
        this.logoVet = (data.dato_profesional as any)?.foto_perfil || 'assets/default-user.png';
        this.estadoSolicitud = data.estado_solicitud ?? 'rechazada';

        // Buscar el nombre legible desde estadosPosibles
        const estado = this.estadosPosibles.find(e => e.id === this.estadoSolicitud);
        this.estadoNombre = estado ? estado.nombre : 'Desconocido';

        // Mostrar siempre el mensaje
        this.mostrarMensajeSolicitud = true;
      } else {
        console.warn('No se encontraron datos para este veterinario.');
      }

    } catch (error) {
      console.error('Error general en ngOnInit:', error);
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
    if (this.estadoSolicitud === '1') {
      this.router.navigate(['/tutor']);
      this.slidingItem.close();
      this.slidingOpen = false;
    }
  }

  irAAgenda() {
    if (this.estadoSolicitud === '1') {
      this.router.navigate(['/agenda']);
    }
  }

  irAConsulta() {
    if (this.estadoSolicitud === '1') {
      this.router.navigate(['/atencion-medica']);
    }
  }

  irARecetas() {
    if (this.estadoSolicitud === '1') {
      this.router.navigate(['/recetas']);
    }
  }

  irADashboard() {
    if (this.estadoSolicitud === '1') {
      this.router.navigate(['/dashboard']);
    }
  }

  getColorEstado(): string {
    switch(this.estadoSolicitud) {
      case '1': // aceptado
        return 'success';    // verde
      case '2': // pendiente
        return 'danger';    // amarillo
      case '3': // rechazada
        return 'warning';     // rojo
      default:
        return 'medium';     // gris o color por defecto
    }
  }


}
