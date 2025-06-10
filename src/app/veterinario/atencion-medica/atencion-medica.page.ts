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



  constructor(private router: Router) { }

  ngOnInit() {
        this.cargarHistorial();
  }

    async ionViewWillEnter() {
    await this.cargarHistorial()
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
        masc_nom
      ),
        motivo_consulta (
        motivo)
    `)
    .eq('run_vet', runVet)  // filtro con el run_vet del veterinario
    .order('fecha_hora_atencion', { ascending: false });

  if (error) {
    console.error('Error al cargar historial:', error);
    return;
  }

  this.historialAtenciones = data;
}





// -------------------------------------AGREGAR ATENCION--------------------------------
    irAgregarAtencion() {
      this.router.navigate(['/veterinario/atencion-medica/agregar-atencion-medica']);
  }


}
