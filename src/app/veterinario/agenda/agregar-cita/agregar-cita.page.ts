import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { FormsModule } from '@angular/forms';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-agregar-cita',
  templateUrl: './agregar-cita.page.html',
  styleUrls: ['./agregar-cita.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class AgregarCitaPage implements OnInit {
  busquedaTutor: string = '';
  tutores: any[] = [];
  tutoresFiltrados: any[] = [];
  tutorSeleccionado: any = null;
  mascotaSeleccionada: any = null;
  mascotasDelTutor: any[] = [];

  comentarioCita: string = '';
  fechaHoraCita: string = ''; // ISO string con fecha y hora

  runVet: string | null = null;
  loading = false;

  constructor(
    private toastController: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.getRunVetFromVeterinario();
    if (this.runVet) {
      await this.cargarTutores();
    }
  }

  async getRunVetFromVeterinario() {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      this.presentToast('No se pudo obtener el usuario autenticado');
      return;
    }

    const idAuth = authData.user.id;

    const { data: vetData, error: vetError } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', idAuth)
      .single();

    if (vetError || !vetData) {
      this.presentToast('No se pudo obtener el run del veterinario');
      return;
    }

    this.runVet = vetData.run_vet;
  }

  // Trae todos los tutores afiliados al veterinario y sus mascotas
  async cargarTutores() {
    if (!this.runVet) return;

    const { data, error } = await supabase
      .from('tutor')
      .select('*, mascota(*)')
      .eq('run_vet', this.runVet);

    if (error) {
      this.presentToast('Error al cargar tutores');
      console.error(error);
      return;
    }

    this.tutores = data || [];
  }

  filtrarTutores() {
    const filtro = this.busquedaTutor.trim().toLowerCase();
    this.tutoresFiltrados = this.tutores.filter(tutor =>
      (tutor.nombre_tutor + ' ' + (tutor.apellidos_tutor || '')).toLowerCase().includes(filtro)
    );
  }

  seleccionarTutor(tutor: any) {
    this.tutorSeleccionado = tutor;
    this.busquedaTutor = `${tutor.nombre_tutor} ${tutor.apellidos_tutor}`;
    this.tutoresFiltrados = [];
    this.mascotaSeleccionada = null;
    this.mascotasDelTutor = tutor.mascota || [];
  }

  async guardarCita() {
    if (!this.tutorSeleccionado || !this.mascotaSeleccionada) {
      this.presentToast('Debe seleccionar un tutor y una mascota');
      return;
    }
    if (!this.fechaHoraCita) {
      this.presentToast('Debe seleccionar fecha y hora de la cita');
      return;
    }

    this.loading = true;

    const fechaHoraISO = new Date(this.fechaHoraCita).toISOString();

    const { data, error } = await supabase
      .from('cita')
      .insert({
        run_vet: this.runVet,
        id_masc: this.mascotaSeleccionada.id_masc,
        comentario_cita: this.comentarioCita || '',
        fecha_cita: fechaHoraISO,
        id_estado_cita: 1 // Estado inicial
      });

    if (error) {
      console.error('Error al guardar cita:', error);
      this.presentToast('Error al guardar la cita');
      this.loading = false;
      return;
    }

    this.presentToast('Cita guardada correctamente');
    this.loading = false;
    this.router.navigate(['/agenda']);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom'
    });
    await toast.present();
  }
}
