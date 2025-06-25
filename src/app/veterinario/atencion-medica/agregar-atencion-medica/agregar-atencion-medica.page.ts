import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { ModalFechaComponent } from 'src/app/modal-fecha/modal-fecha.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-agregar-atencion-medica',
  templateUrl: './agregar-atencion-medica.page.html',
  styleUrls: ['./agregar-atencion-medica.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent]
})
export class AgregarAtencionMedicaPage implements OnInit {
  busquedaTutor = '';
  tutores: any[] = [];
  tutoresFiltrados: any[] = [];
  tutorSeleccionado: any = null;
  mascotaSeleccionada: any = null;

  estadoSensorial: any[] = [];
  nivelesHidratacion: any[] = [];

  tratamientoList: any[] = [];

  // Examen objetivo particular
  pielOpciones: any[] = [];
  mostrarObservacionPiel = false;
  ojosOpciones: any[] = [];
  mostrarObservacionOjos = false;
  oidosOpciones: any[] = [];
  mostrarObservacionOidos = false;
  dentaduraOpciones: any[] = [];
  mostrarObservacionDentadura = false;

  motivosConsulta: any[] = [];

  mostrarSelectorFecha = false;
  mostrarSelectorHora = false;

  atencion = {
    motivo: null,
    anamnesis: '',
    diagnostico: '',
    tratamiento: '',
    tratamiento_indicaciones: '',
    observaciones: '',
    mucosa: '',
    temperatura: null,
    peso: null,
    condicion_corporal: '',
    observacion: '',
    estado_sensorial_id: null,
    hidratacion_id: null,
    fecha: '',
    hora: '',
    id_piel: null,
    piel_observacion: '',
    id_ojos: null,
    ojos_observacion: '',
    id_oidos: null,
    oidos_observacion: '',
    id_dentadura: null,
    dentadura_observacion: '',
  };

  constructor(
    private modalCtrl: ModalController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarTutores();
    this.cargarMotivosConsulta();
    this.cargarEstadosSensoriales();
    this.cargarNivelesHidratacion();
    this.cargarPielOpciones();
    this.cargarOjosOpciones();
    this.cargarOidosOpciones();
    this.cargarDentaduraOpciones();
  }

  // ------------------------- Carga de datos -------------------------
  async cargarTutores() {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) return console.error('Usuario no autenticado');

    const { data: vet, error: vetError } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', user.user.id)
      .single();

    if (vetError || !vet) return console.error('Veterinario no encontrado');

    const { data: tutores, error: tutoresError } = await supabase
      .from('tutor')
      .select(`*, mascota(*)`)
      .eq('run_vet', vet.run_vet);

    if (tutoresError) return console.error('Error al cargar tutores:', tutoresError);
    this.tutores = tutores;
  }

  async cargarMotivosConsulta() {
    const { data, error } = await supabase.from('motivo_consulta').select('*');
    if (error) return console.error('Error al cargar motivos:', error);
    this.motivosConsulta = data;
  }

  async cargarEstadosSensoriales() {
    const { data, error } = await supabase.from('estado_sensorial').select('id_estado_sensorial, estado_sensorial');
    if (error) return console.error('Error al cargar estados sensoriales:', error);
    this.estadoSensorial = data;
  }

  async cargarNivelesHidratacion() {
    const { data, error } = await supabase.from('hidratacion').select('hidratacion_id, estado_hidratacion');
    if (error) return console.error('Error al cargar niveles de hidratación:', error);
    this.nivelesHidratacion = data;
  }

  async cargarPielOpciones() {
    const { data, error } = await supabase.from('piel_obp').select('*');
    if (error) return console.error('Error al cargar Piel', error);
    this.pielOpciones = data;
    this.verificarObservacionPiel();
  }

  verificarObservacionPiel() {
    const seleccionada = this.pielOpciones.find(d => d.id_piel === this.atencion.id_piel);
    this.mostrarObservacionPiel = seleccionada?.requiere_observacion === true;
  }

  async cargarOjosOpciones() {
    const { data, error } = await supabase.from('ojos_obp').select('*');
    if (error) return console.error('Error al cargar Ojos', error);
    this.ojosOpciones = data;
    this.verificarObservacionOjos();
  }

  verificarObservacionOjos() {
    const seleccionada = this.ojosOpciones.find(d => d.id_ojos === this.atencion.id_ojos);
    this.mostrarObservacionOjos = seleccionada?.requiere_observacion === true;
  }

  async cargarOidosOpciones() {
    const { data, error } = await supabase.from('oidos_obp').select('*');
    if (error) return console.error('Error al cargar Oidos', error);
    this.oidosOpciones = data;
    this.verificarObservacionOidos();
  }

  verificarObservacionOidos() {
    const seleccionada = this.oidosOpciones.find(d => d.id_oidos === this.atencion.id_oidos);
    this.mostrarObservacionOidos = seleccionada?.requiere_observacion === true;
  }

  async cargarDentaduraOpciones() {
    const { data, error } = await supabase.from('dentadura_obp').select('*');
    if (error) return console.error('Error al cargar Dentadura', error);
    this.dentaduraOpciones = data;
    this.verificarObservacionDentadura();
  }

  verificarObservacionDentadura() {
    const seleccionada = this.dentaduraOpciones.find(d => d.id_dentadura === this.atencion.id_dentadura);
    this.mostrarObservacionDentadura = seleccionada?.requiere_observacion === true;
  }

  // ------------------------- Tutor y mascota -------------------------
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

  // ------------------------- Fecha y hora -------------------------
  abrirSelectorHora() {
    this.mostrarSelectorHora = true;
  }

  seleccionarFecha(event: any) {
    this.atencion.fecha = event.detail.value.split('T')[0];
  }

  seleccionarHora(event: any) {
    this.atencion.hora = event.detail.value.split('T')[1].substring(0, 5);
  }

  async abrirSelectorFecha() {
    const modal = await this.modalCtrl.create({
      component: ModalFechaComponent,
      componentProps: { fecha: this.atencion.fecha }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.atencion.fecha = data.fecha;
      this.atencion.hora = data.hora;
    }
  }

  // ------------------------- Tratamiento -------------------------
  agregarMedicamento() {
    this.tratamientoList.push({ nombre: '', dosis: '', duracion: '' });
  }

  eliminarMedicamento(index: number) {
    this.tratamientoList.splice(index, 1);
  }

  // ------------------------- Guardar atención -------------------------
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

  async guardarAtencion() {

    if (!this.tutorSeleccionado || !this.mascotaSeleccionada) return this.mostrarToast('Debes seleccionar un tutor y una mascota.');
    if (!this.atencion.fecha || !this.atencion.hora || !this.atencion.motivo) return this.mostrarToast('Completa los campos obligatorios: fecha, hora y motivo.');

    const runVet = await this.obtenerRunVet();
    if (!runVet) return this.mostrarToast('No se pudo identificar al veterinario.');

    const fechaHoraAtencion = new Date(`${this.atencion.fecha}T${this.atencion.hora}`);

    console.log('Observaciones a guardar:', {
      obs_piel: this.atencion.piel_observacion,
      obs_ojos: this.atencion.ojos_observacion,
      obs_oidos: this.atencion.oidos_observacion,
      obs_dentadura: this.atencion.dentadura_observacion,
    });

    const { error } = await supabase.from('atencion_medica').insert([{
      motivo_id: this.atencion.motivo,
      anamnesis: this.atencion.anamnesis,
      diagnostico: this.atencion.diagnostico,
      tratamiento: this.atencion.tratamiento,
      tratamiento_indicaciones: this.atencion.tratamiento_indicaciones,
      observaciones: this.atencion.observaciones,
      mucosa: this.atencion.mucosa,
      temperatura: this.atencion.temperatura,
      peso: this.atencion.peso,
      condicion_corporal: this.atencion.condicion_corporal,
      observacion_examen: this.atencion.observacion,
      estado_sensorial_id: this.atencion.estado_sensorial_id,
      hidratacion_id: this.atencion.hidratacion_id,
      id_masc: this.mascotaSeleccionada.id_masc,
      fecha_hora_atencion: fechaHoraAtencion.toISOString(),
      run_vet: runVet,
      id_piel: this.atencion.id_piel,
      id_ojos: this.atencion.id_ojos,
      id_oidos: this.atencion.id_oidos,
      id_dentadura: this.atencion.id_dentadura,
      obs_piel: this.atencion.piel_observacion,
      obs_ojos: this.atencion.ojos_observacion,
      obs_oidos: this.atencion.oidos_observacion,
      obs_dentadura: this.atencion.dentadura_observacion,
    }]);

    if (error) return this.mostrarToast('Hubo un error al guardar la atención.');
    this.mostrarToast('Atención médica guardada exitosamente.');
    this.reiniciarFormulario();
  }

  reiniciarFormulario() {
    this.atencion = {
      motivo: null,
      anamnesis: '',
      diagnostico: '',
      tratamiento: '',
      tratamiento_indicaciones: '',
      observaciones: '',
      mucosa: '',
      temperatura: null,
      peso: null,
      condicion_corporal: '',
      observacion: '',
      estado_sensorial_id: null,
      hidratacion_id: null,
      fecha: '',
      hora: '',
      id_piel: null,
      piel_observacion: '',
      id_ojos: null,
      ojos_observacion: '',
      id_oidos: null,
      oidos_observacion: '',
      id_dentadura: null,
      dentadura_observacion: '',
    };
    this.tutorSeleccionado = null;
    this.mascotaSeleccionada = null;
  }

  private async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'middle',
    });
    toast.present();
  }
}