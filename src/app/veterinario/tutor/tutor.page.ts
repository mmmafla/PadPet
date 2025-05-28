import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { createClient } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';

// Configuración de Supabase
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-tutor',
  templateUrl: './tutor.page.html',
  styleUrls: ['./tutor.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule, HeaderComponent]
})
export class TutorPage implements OnInit {
  tutores: any[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
    await this.cargarTutores();
  }

  async cargarTutores() {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      console.error('Usuario no autenticado');
      return;
    }

    const { data: vet, error: vetError } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', user.user.id)
      .single();

    if (vetError || !vet) {
      console.error('No se encontró el veterinario', vetError);
      return;
    }

    const { data: tutores, error: tutoresError } = await supabase
      .from('tutor')
      .select('*')
      .eq('run_vet', vet.run_vet);

    if (tutoresError) {
      console.error('Error al cargar tutores', tutoresError);
    } else {
      this.tutores = tutores;
    }
  }

  irAgregarTutor() {
    this.router.navigate(['/veterinario/tutor/agregar-tutor']);
  }
}
