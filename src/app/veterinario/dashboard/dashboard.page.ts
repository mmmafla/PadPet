import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { ChartComponent } from 'src/app/componentes/chart/chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Supabase
import { createClient } from '@supabase/supabase-js';

// Reemplaza con tus datos reales
const supabase = createClient(
  'https://irorlonysbmkbdthvrmt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek'
);

interface Estadistica {
  total_atenciones: number;
  motivos: { [key: string]: number };
  sistemas: { [key: string]: number };
  alimentacion: { [key: string]: number };
  estado_sensorial: { [key: string]: number };
  especies?: { [key: string]: number }; // opcional
  temperatura_prom: number;
  peso_prom: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    ChartComponent,
  ]
})
export class DashboardPage implements OnInit {

  estadisticas: Estadistica | null = null;
  cargando: boolean = false;

  mesSeleccionado: number = new Date().getMonth() + 1; // mes actual (1-12)
  annoSeleccionado: number = new Date().getFullYear();
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  anios: number[] = [];
  private cantidadAnios = 50;

  constructor() {}

  async ngOnInit() {
    const añoActual = new Date().getFullYear();
    this.anios = Array.from({ length: this.cantidadAnios }, (_, i) => añoActual - i);
    await this.obtenerEstadisticasDashboard();
  }

  async obtenerEstadisticasDashboard() {
    this.cargando = true;

    // 1. Obtener el usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error al obtener usuario autenticado:', userError);
      this.cargando = false;
      return;
    }

    // 2. Consultar la tabla veterinario para obtener el run_vet
    const { data: vetData, error: vetError } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', user.id)
      .single();

    if (vetError || !vetData) {
      console.error('Error al obtener run_vet del veterinario:', vetError);
      this.cargando = false;
      return;
    }

    const runVet = vetData.run_vet;

    // 3. Calcular fechas según mes/año seleccionados
    const fechaInicio = new Date(this.annoSeleccionado, this.mesSeleccionado - 1, 1);
    const fechaFin = new Date(this.annoSeleccionado, this.mesSeleccionado, 0);
    const fecha_inicio_str = fechaInicio.toISOString().split('T')[0];
    const fecha_fin_str = fechaFin.toISOString().split('T')[0];

    // 4. Llamar función RPC
    const { data, error } = await supabase.rpc('get_estadisticas_dashboard', {
      run_vet_input: runVet,
      fecha_inicio: fecha_inicio_str,
      fecha_fin: fecha_fin_str
    });

    if (error) {
      console.error('Error al obtener estadísticas:', error);
    } else {
      this.estadisticas = data;
      console.log('Datos para el gráfico:', this.getEspeciesData());
      console.log('Etiquetas para el gráfico:', this.getEspeciesLabels());
      console.log('Estadísticas cargadas:', this.estadisticas);
    }

    this.cargando = false;
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getEspeciesData(): number[] {
    return this.estadisticas?.especies ? Object.values(this.estadisticas.especies) : [];
  }

  getEspeciesLabels(): string[] {
    return this.estadisticas?.especies ? Object.keys(this.estadisticas.especies) : [];
  }
}