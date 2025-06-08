import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, RefresherCustomEvent, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { createClient } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-tutor',
  templateUrl: './tutor.page.html',
  styleUrls: ['./tutor.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule, HeaderComponent, FormsModule]
})
export class TutorPage implements OnInit {
  tutores: any[] = [];
  busqueda: string = '';
  tutoresFiltrados: any[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.cargarTutores(); // Se ejecuta solo una vez
  }

  // Se ejecuta cada vez que vuelves a esta vista
  async ionViewWillEnter() {
    await this.cargarTutores();
  }
//-------------------------
async cargarTutores() {
  const loading = await this.loadingController.create({
    spinner: 'circles'
  });

  await loading.present();

  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user.user) {
    console.error('Usuario no autenticado');
    await loading.dismiss();
    return;
  }

  const { data: vet, error: vetError } = await supabase
    .from('veterinario')
    .select('run_vet')
    .eq('id_auth', user.user.id)
    .single();

  if (vetError || !vet) {
    console.error('No se encontró el veterinario', vetError);
    await loading.dismiss();
    return;
  }

  const { data: tutores, error: tutoresError } = await supabase
    .from('tutor')
    .select(`*, mascota(*)`)
    .eq('run_vet', vet.run_vet);

  if (tutoresError) {
    console.error('Error al cargar tutores', tutoresError);
  } else {
    this.tutores = tutores;
    this.tutoresFiltrados = tutores; // 👈 Agrega esta línea para que se vean
  }

  await loading.dismiss();
}




  filtrarTutores() {
  const filtro = this.busqueda.trim().toLowerCase();
  this.tutoresFiltrados = this.tutores.filter(tutor =>
    (tutor.nombre_tutor + ' ' + (tutor.apellidos_tutor || '')).toLowerCase().includes(filtro)
  );
}

  irAgregarTutor() {
    this.router.navigate(['/veterinario/tutor/agregar-tutor']);
  }

  irEditarTutor(runTutor: string) {
    this.router.navigate(['/veterinario/tutor/editar-tutor', runTutor]);
  }

  irVerMascotas(runTutor: string) {
    this.router.navigate(['/veterinario/tutor/mascotas', runTutor]);
  }

  async handleRefresh(event: RefresherCustomEvent) {
    await this.cargarTutores();
    event.detail.complete();
  }


}
