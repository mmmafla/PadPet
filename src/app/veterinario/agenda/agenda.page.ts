import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent
  ]
})
export class AgendaPage implements OnInit {
  historialRecetas: any[] = [];
  historialRecetasOriginal: any[] = [];
  filtroFecha: string | null = null;
  filtroEstado: string | null = null;
  estadosDisponibles: { id_estado_cita: number, nombre_estado_cita: string }[] = [];

  runVet: string | null = null;
  loading = false;

  constructor(
    private toastController: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.getRunVetFromVeterinario();
    await this.getEstadosCita();
    if (this.runVet) {
      await this.getHistorialCitas();
    }
  }

  ionViewWillEnter() {
    this.initData();
  }

  async initData() {
    await this.getRunVetFromVeterinario();
    await this.getEstadosCita();
    if (this.runVet) {
      await this.getHistorialCitas();
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

  async getEstadosCita() {
    const { data, error } = await supabase
      .from('estado_cita')
      .select('id_estado_cita, nombre_estado_cita')
      .order('nombre_estado_cita', { ascending: true });

    if (error) {
      this.presentToast('Error al cargar estados de cita');
      return;
    }

    this.estadosDisponibles = data || [];
  }

  async getHistorialCitas() {
    this.loading = true;

    const { data: citas, error } = await supabase
      .from('cita')
      .select(`
        id_cita,
        fecha_cita,
        comentario_cita,
        id_estado_cita,
        mascota (
          id_masc,
          masc_nom
        ),
        estado_cita:estado_cita!id_estado_cita (
          nombre_estado_cita
        )
      `)
      .eq('run_vet', this.runVet)
      .order('fecha_cita', { ascending: false });

    if (error) {
      console.error('Error al obtener citas:', error);
      this.presentToast('Error al obtener citas');
      this.loading = false;
      return;
    }

    this.historialRecetasOriginal = citas || [];
    this.historialRecetas = [...this.historialRecetasOriginal];
    this.loading = false;
  }

  filtrarRecetas() {
    this.historialRecetas = this.historialRecetasOriginal.filter(cita => {
      const coincideFecha = this.filtroFecha
        ? new Date(cita.fecha_cita).toDateString() === new Date(this.filtroFecha).toDateString()
        : true;

      const coincideEstado = this.filtroEstado
        ? String(cita.id_estado_cita) === this.filtroEstado
        : true;

      return coincideFecha && coincideEstado;
    });
  }

  limpiarFiltros() {
    this.filtroFecha = null;
    this.filtroEstado = null;
    this.historialRecetas = [...this.historialRecetasOriginal];
  }

  irAgregarReceta() {
    this.router.navigate(['/veterinario/agenda/agregar-cita']);
  }

  verDetalleReceta(id_cita: any) {
    this.router.navigate(['/veterinario/agenda/detalle-cita'], { state: { id_cita } });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}