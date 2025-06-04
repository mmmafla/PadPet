import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

// Configuración de Supabase
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-agregar-atencion-medica',
  templateUrl: './agregar-atencion-medica.page.html',
  styleUrls: ['./agregar-atencion-medica.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent]
})
export class AgregarAtencionMedicaPage implements OnInit {

  constructor() { }

  tutor: any = null;

  async ngOnInit() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('No se pudo obtener el usuario:', error);
      return;
    }

    const { data: veterinario, error: errorVet } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', user.id)
      .single();

    if (errorVet || !veterinario) {
      console.error('No se pudo obtener el run del veterinario:', errorVet);
      return;
    }

    const { data: tutorAfiliado, error: errorTutor } = await supabase
      .from('tutor')
      .select('*')
      .eq('run_vet', veterinario.run_vet)
      .limit(1)
      .single();

    if (errorTutor) {
      console.error('Error al obtener el tutor afiliado:', errorTutor);
      return;
    }

    this.tutor = tutorAfiliado;
  }

}
