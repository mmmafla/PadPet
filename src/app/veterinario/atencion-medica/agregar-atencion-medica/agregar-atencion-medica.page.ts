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

  motivosConsulta: any[] = [];

atencion = {
  motivo: null,
  anamnesis: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: '',
  mucosa: '',
  temperatura: null,
  peso: null,
  condicion_corporal: '',
  observacion: '',
  estado_sensorial_id: null,
  hidratacion_id: null,
  fecha: '',
  hora: ''
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
      console.error('Veterinario no encontrado');
      return;
    }

    const { data: tutores, error: tutoresError } = await supabase
      .from('tutor')
      .select(`*, mascota(*)`)
      .eq('run_vet', vet.run_vet);

    if (tutoresError) {
      console.error('Error al cargar tutores:', tutoresError);
    } else {
      this.tutores = tutores;
    }
  }

  async cargarMotivosConsulta() {
    const { data, error } = await supabase
      .from('motivo_consulta')
      .select('*');

    if (error) {
      console.error('Error al cargar motivos:', error);
    } else {
      this.motivosConsulta = data;
    }
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


  // ----
  async cargarEstadosSensoriales() {
  const { data, error } = await supabase
    .from('estado_sensorial')
    .select('id_estado_sensorial, estado_sensorial');

  if (error) {
    console.error('Error al cargar estados sensoriales:', error);
  } else {
    this.estadoSensorial = data;
  }
}

async cargarNivelesHidratacion() {
  const { data, error } = await supabase
    .from('hidratacion')
    .select('hidratacion_id, estado_hidratacion');

  if (error) {
    console.error('Error al cargar niveles de hidratación:', error);
  } else {
    this.nivelesHidratacion = data;
  }
}
// ----
   
//----------------------------------FECHA Y HORA DE ATENCION-----------------------------
mostrarSelectorFecha = false;
mostrarSelectorHora = false;

abrirSelectorHora() {
  this.mostrarSelectorHora = true;
}
seleccionarFecha(event: any) {
  this.atencion.fecha = event.detail.value.split('T')[0]; // solo YYYY-MM-DD
}
seleccionarHora(event: any) {
  this.atencion.hora = event.detail.value.split('T')[1].substring(0, 5); // HH:mm
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
// ---------------------------------------
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
//----------------------------------FECHA Y HORA DE ATENCION-----------------------------
//----------------------------------GUARDAR ATENCION-----------------------------
async guardarAtencion() {
  if (!this.tutorSeleccionado || !this.mascotaSeleccionada) {
    this.mostrarToast('Debes seleccionar un tutor y una mascota.');
    return;
  }

  if (!this.atencion.fecha || !this.atencion.hora || !this.atencion.motivo) {
    this.mostrarToast('Completa los campos obligatorios: fecha, hora y motivo.');
    return;
  }
    const runVet = await this.obtenerRunVet();
  if (!runVet) {
    this.mostrarToast('No se pudo identificar al veterinario.');
    return;
  }

  const fechaHoraAtencion = new Date(`${this.atencion.fecha}T${this.atencion.hora}`);

  const { error } = await supabase.from('atencion_medica').insert([{
    motivo_id: this.atencion.motivo,
    anamnesis: this.atencion.anamnesis,
    diagnostico: this.atencion.diagnostico,
    tratamiento: this.atencion.tratamiento,
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
  }]);

  if (error) {
    console.error('Error al guardar la atención:', error);
    this.mostrarToast('Hubo un error al guardar la atención.');
  } else {
    this.mostrarToast('Atención médica guardada exitosamente.');

    console.log('Valores a insertar:', {
  motivo_id: this.atencion.motivo,
  anamnesis: this.atencion.anamnesis,
  diagnostico: this.atencion.diagnostico,
  tratamiento: this.atencion.tratamiento,
  observaciones: this.atencion.observaciones,
  mucosa: this.atencion.mucosa,
  temperatura: this.atencion.temperatura,
  peso: this.atencion.peso,
  condicion_corporal: this.atencion.condicion_corporal,
  observacion_examen: this.atencion.observacion,
  estado_sensorial_id: this.atencion.estado_sensorial_id,
  hidratacion_id: this.atencion.hidratacion_id,
  id_masc: this.mascotaSeleccionada.id_masc,
  fecha_hora_atencion: fechaHoraAtencion.toISOString()
});

    this.reiniciarFormulario();
  }
}

reiniciarFormulario() {
  this.atencion = {
    motivo: null,
    anamnesis: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    mucosa: '',
    temperatura: null,
    peso: null,
    condicion_corporal: '',
    observacion: '',
    estado_sensorial_id: null,
    hidratacion_id: null,
    fecha: '',
    hora: ''
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
