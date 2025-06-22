import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);


@Component({
  selector: 'app-atencion-medica',
  templateUrl: './atencion-medica.page.html',
  styleUrls: ['./atencion-medica.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent] 

})
export class AtencionMedicaPage implements OnInit {
  historialAtenciones: any[] = [];
  filtroMotivo: string = '';
  filtroFecha: string | null = null;
  todasLasAtenciones: any[] = []; 
  motivosDisponibles: any[] = [];



  constructor(private router: Router) { }

  ngOnInit() {
        this.cargarHistorial();
        this.cargarMotivosConsulta();

  }

    async ionViewWillEnter() {
    await this.cargarHistorial();
    await this.cargarMotivosConsulta();
  }


    async obtenerRunVet(): Promise<number | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return null;

    const { data, error } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', userId)
      .single();

    if (error || !data) {
      console.error('No se pudo obtener run_vet:', error?.message);
      return null;
    }

    return data.run_vet;
  }

async cargarHistorial() {
  const runVet = await this.obtenerRunVet();
  if (!runVet) {
    console.warn('No se pudo obtener el RUN del veterinario');
    return;
  }

  const { data, error } = await supabase
    .from('atencion_medica')
    .select(`
    *,
    mascota (
      masc_nom,
      tutor (
        nombre_tutor,
        apellidos_tutor
      ),
      sexo_mascota (masc_sexo)
    ),
    motivo_consulta (
      motivo
        ),
      hidratacion(
        estado_hidratacion
        ),
      estado_sensorial(
        estado_sensorial
        )

    `)
    .eq('run_vet', runVet)  // filtro con el run_vet del veterinario
    .order('fecha_hora_atencion', { ascending: false });

  if (error) {
    console.error('Error al cargar historial:', error);
    return;
  }

  this.todasLasAtenciones = data || [];
  this.historialAtenciones = [...this.todasLasAtenciones];
}


async cargarMotivosConsulta() {
  const { data, error } = await supabase
    .from('motivo_consulta')
    .select('id, motivo')
    .order('motivo', { ascending: true });

  if (error) {
    console.error('Error al cargar motivos:', error);
    return;
  }

  this.motivosDisponibles = data || [];
}



filtrarAtenciones() {
  this.historialAtenciones = this.todasLasAtenciones.filter(atencion => {
    const motivoCoincide = this.filtroMotivo
      ? atencion.motivo_consulta?.motivo === this.filtroMotivo
      : true;

    const fechaCoincide = this.filtroFecha
      ? atencion.fecha_hora_atencion?.startsWith(this.filtroFecha)
      : true;

    return motivoCoincide && fechaCoincide;
  });
}


limpiarFiltros() {
  this.filtroMotivo = '';
  this.filtroFecha = null;
  this.historialAtenciones = [...this.todasLasAtenciones];
}



// -------------------------------------AGREGAR ATENCION--------------------------------
    irAgregarAtencion() {
      this.router.navigate(['/veterinario/atencion-medica/agregar-atencion-medica']);
  }

verDetalle(id: number) {
  this.router.navigate(['/detalle-atencion'], { state: { id: id }  });
}

}
