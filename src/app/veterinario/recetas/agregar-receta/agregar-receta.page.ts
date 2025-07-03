import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

// ... (importaciones y configuración igual que antes)

@Component({
  selector: 'app-agregar-receta',
  templateUrl: './agregar-receta.page.html',
  styleUrls: ['./agregar-receta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class AgregarRecetaPage implements OnInit {
  busquedaTutor: string = '';
  tutores: any[] = [];
  tutoresFiltrados: any[] = [];
  tutorSeleccionado: any | null = null;
  mascotaSeleccionada: any | null = null;

  tratamiento_indicaciones: string = '';
  tratamientoList: { id_medicamento: number | null; dosis: string; duracion: string }[] = [];
  medicamentosDisponibles: any[] = [];

  runVet: string | null = null;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.obtenerRunVet();
    if (this.runVet) {
      this.cargarTutores();
      this.cargarMedicamentos();
    }
  }

  async cargarMedicamentos() {
    const { data, error } = await supabase
      .from('medicamento')
      .select('id_medicamento, nombre_medicamento');

    if (error) {
      console.error('Error al cargar medicamentos:', error);
      return;
    }

    this.medicamentosDisponibles = data || [];
  }

  async obtenerRunVet() {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      console.error('No se pudo obtener user.id desde la sesión:', sessionError);
      await this.mostrarToast('No se pudo identificar al usuario', 'danger');
      return;
    }

    const { data, error } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', userId)
      .single();

    if (error || !data) {
      console.error('Error obteniendo run_vet:', error);
      await this.mostrarToast('Error obteniendo datos del veterinario', 'danger');
      return;
    }

    this.runVet = data.run_vet;
  }

  async cargarTutores() {
    if (!this.runVet) return;

    const { data, error } = await supabase
      .from('tutor')
      .select('*, mascota(*)')
      .eq('run_vet', this.runVet);

    if (error) {
      console.error('Error cargando tutores:', error);
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
  }

  seleccionarMascota(mascota: any) {
    this.mascotaSeleccionada = mascota;
  }

  agregarMedicamento() {
    this.tratamientoList.push({ id_medicamento: null, dosis: '', duracion: '' });
  }

  eliminarMedicamento(index: number) {
    this.tratamientoList.splice(index, 1);
  }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'middle',
    });
    toast.present();
  }

  async guardarReceta() {
    if (!this.tutorSeleccionado || !this.mascotaSeleccionada) {
      return this.mostrarToast('Debes seleccionar tutor y mascota', 'warning');
    }
    if (!this.tratamiento_indicaciones.trim()) {
      return this.mostrarToast('Escribe indicaciones generales', 'warning');
    }
    if (this.tratamientoList.length === 0) {
      return this.mostrarToast('Agrega al menos un medicamento', 'warning');
    }
    for (const med of this.tratamientoList) {
      if (!med.id_medicamento || !med.dosis.trim() || !med.duracion.trim()) {
        return this.mostrarToast('Completa todos los datos de los medicamentos', 'warning');
      }
    }

    const alert = await this.alertController.create({
      header: '¿Confirmar receta?',
      message: `Se registrarán ${this.tratamientoList.length} medicamentos para ${this.mascotaSeleccionada.masc_nom}.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: () => this.guardarRecetaEnBD() }
      ]
    });

    await alert.present();
  }

  async guardarRecetaEnBD() {
    const fechaActual = new Date().toISOString();

    const { data: recetaInsertada, error: recetaError } = await supabase
      .from('receta')
      .insert([{
        indicaciones: this.tratamiento_indicaciones,
        id_masc: this.mascotaSeleccionada.id_masc,
        fecha_receta: fechaActual
      }])
      .select('id_receta')
      .single();

    if (recetaError || !recetaInsertada) {
      console.error('Error al guardar receta:', recetaError);
      return this.mostrarToast('No se pudo guardar la receta', 'danger');
    }

    const idReceta = recetaInsertada.id_receta;

    const detalles = this.tratamientoList.map(med => ({
      id_receta: idReceta,
      id_medicamento: med.id_medicamento,
      dosis_medicamento: med.dosis,
      duracion_medicamento: med.duracion
    }));

    const { error: detalleError } = await supabase
      .from('detalle_receta')
      .insert(detalles);

    if (detalleError) {
      console.error('Error al guardar medicamentos:', detalleError);
      return this.mostrarToast('No se pudieron guardar los medicamentos', 'danger');
    }

    this.mostrarToast('Receta registrada exitosamente');
    this.limpiarFormulario();
    this.router.navigate(['/veterinario/recetas']);
  }

  limpiarFormulario() {
    this.busquedaTutor = '';
    this.tutoresFiltrados = [];
    this.tutorSeleccionado = null;
    this.mascotaSeleccionada = null;
    this.tratamiento_indicaciones = '';
    this.tratamientoList = [];
  }
}

