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
  selector: 'app-recetas',
  templateUrl: './recetas.page.html',
  styleUrls: ['./recetas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent]
})
export class RecetasPage implements OnInit {
  historialRecetas: any[] = [];
  todasLasRecetas: any[] = [];
  filtroFecha: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarHistorialRecetas();
  }

  async ionViewWillEnter() {
    await this.cargarHistorialRecetas();
  }

  async obtenerRunVet(): Promise<string | null> {
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

  async cargarHistorialRecetas() {
    const runVet = await this.obtenerRunVet();
    if (!runVet) {
      console.warn('No se pudo obtener el RUN del veterinario');
      return;
    }

    // Obtener tutores del veterinario
    const { data: tutores, error: errorTutores } = await supabase
      .from('tutor')
      .select('id_tutor')
      .eq('run_vet', runVet);

    if (errorTutores || !tutores) {
      console.error('Error al obtener tutores:', errorTutores);
      return;
    }

    const idTutores = tutores.map(t => t.id_tutor);
    if (idTutores.length === 0) {
      this.todasLasRecetas = [];
      this.historialRecetas = [];
      return;
    }

    // Obtener mascotas de esos tutores
    const { data: mascotas, error: errorMascotas } = await supabase
      .from('mascota')
      .select('id_masc, masc_nom, id_tutor')
      .in('id_tutor', idTutores);

    if (errorMascotas || !mascotas) {
      console.error('Error al obtener mascotas:', errorMascotas);
      return;
    }

    const mascotasMap = new Map(mascotas.map(m => [m.id_masc, m]));
    const idMascotas = mascotas.map(m => m.id_masc);

    if (idMascotas.length === 0) {
      this.todasLasRecetas = [];
      this.historialRecetas = [];
      return;
    }

    // Obtener recetas
    const { data: recetas, error: errorRecetas } = await supabase
      .from('receta')
      .select('id_receta, indicaciones, fecha_receta, id_masc')
      .in('id_masc', idMascotas)
      .order('fecha_receta', { ascending: false });

    if (errorRecetas || !recetas) {
      console.error('Error al obtener recetas:', errorRecetas);
      return;
    }

    // Obtener detalle_receta
    const idRecetas = recetas.map(r => r.id_receta);
    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalle_receta')
      .select('id_receta, id_medicamento, dosis_medicamento, duracion_medicamento, medicamento(nombre_medicamento)')
      .in('id_receta', idRecetas);

    if (errorDetalles || !detalles) {
      console.error('Error al obtener detalle_receta:', errorDetalles);
      return;
    }

    // Unir recetas con sus detalles y nombre de mascota
    this.todasLasRecetas = recetas.map(receta => ({
      ...receta,
      mascota: mascotasMap.get(receta.id_masc),
      detalle_receta: detalles.filter(d => d.id_receta === receta.id_receta)
    }));

    this.historialRecetas = [...this.todasLasRecetas];
  }

  filtrarRecetas() {
    this.historialRecetas = this.todasLasRecetas.filter(receta => {
      return this.filtroFecha
        ? receta.fecha_receta?.startsWith(this.filtroFecha)
        : true;
    });
  }

  limpiarFiltros() {
    this.filtroFecha = null;
    this.historialRecetas = [...this.todasLasRecetas];
  }

  irAgregarReceta() {
    this.router.navigate(['/veterinario/recetas/agregar-receta']);
  }

  verDetalleReceta(id: number) {
    this.router.navigate(['/veterinario/recetas/detalle-receta'], { state: { id: id } });
  }


}
