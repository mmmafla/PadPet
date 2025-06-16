import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, ReactiveFormsModule, CommonModule, HeaderComponent]
})
export class HomePage implements OnInit {

  supabase: SupabaseService = inject(SupabaseService);

  nombreVet = '';
  apellidosVet ='';
  runVet = '';
  fotoVet = ''; // si tienes fotos en la BD

  estadoSolicitud: string | null = null;
  mostrarMensajeSolicitud = false;

  formatRut(rut: string): string {
    // Elimina cualquier caracter que no sea número o K/k
    rut = String(rut).replace(/^0+|[^0-9kK]+/g, '').toUpperCase();

    if (rut.length < 2) return rut;
    const dv = rut.slice(-1); // Dígito verificador
    let rutBody = rut.slice(0, -1); // Cuerpo del RUT
  
    // Agrega puntos cada 3 dígitos desde el final
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

  
// -------------------------------------------

  async ngOnInit() {
    // Obtener el usuario autenticado
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
        .select('nombre_vet, apellidos_vet, run_vet, estado_solicitud')
        .eq('id_auth', user.id)
        .single();

      if (error) {
        console.error('Error al obtener los datos del veterinario:', error);
        return;
      }

      if (data) {
        this.nombreVet = `${data.nombre_vet} ${data.apellidos_vet}`;
        this.runVet = this.formatRut(data?.run_vet || '');
        this.estadoSolicitud = data.estado_solicitud;
        this.mostrarMensajeSolicitud = true;
      } else {
        console.warn('No se encontraron datos para este veterinario.');
      }
    } catch (error) {
      console.error('Error en la consulta a Supabase:', error);
    }
  }

}
