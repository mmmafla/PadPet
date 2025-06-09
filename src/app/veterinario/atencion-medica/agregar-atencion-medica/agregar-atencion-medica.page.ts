import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
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

  motivosConsulta: any[] = [];

  atencion = {
    motivo: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    fecha: '',
    hora: '',
  };

  constructor(
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.cargarTutores();
    this.cargarMotivosConsulta();
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
   

 guardarAtencion() {
  if (!this.tutorSeleccionado || !this.mascotaSeleccionada || !this.atencion.motivo || !this.atencion.fecha) {
    alert('Debes completar todos los campos obligatorios.');
    return;
  }

  // Combinar fecha y hora
  const fecha = this.atencion.fecha; // formato: YYYY-MM-DD
  const hora = this.atencion.hora || '00:00'; // si no se elige, será medianoche
  const fechaHora = `${fecha}T${hora}`;

  const nuevaAtencion = {
    tutor_run: this.tutorSeleccionado.run_tutor,
    mascota_id: this.mascotaSeleccionada.id,
    motivo_id: this.atencion.motivo,
    sintomas: this.atencion.sintomas,
    diagnostico: this.atencion.diagnostico,
    tratamiento: this.atencion.tratamiento,
    observaciones: this.atencion.observaciones,
    fecha_hora: fechaHora, // este es el campo que se insertará en la BD
  };

  console.log("Guardando atención:", nuevaAtencion);
  // Aquí luego puedes hacer la inserción a Supabase
}

mostrarSelectorFecha = false;
mostrarSelectorHora = false;



abrirSelectorHora() {
  this.mostrarSelectorHora = true;
}

seleccionarFecha(event: any) {
  this.atencion.fecha = event.detail.value.split('T')[0]; // solo YYYY-MM-DD
}

seleccionarHora(event: any) {
  this.atencion.hora = event.detail.value.split('T')[1].substring(0, 5); // solo HH:mm
}

async abrirSelectorFecha() {
  const fechaHoraActual = this.atencion.fecha && this.atencion.hora
    ? `${this.atencion.fecha}T${this.atencion.hora}`
    : '';

  const modal = await this.modalCtrl.create({
    component: ModalFechaComponent,
    componentProps: { fechaActual: fechaHoraActual }
  });

  await modal.present();

  const { data } = await modal.onDidDismiss();
  if (data) {
    // Separar fecha y hora seleccionadas
    const [fecha, hora] = data.split('T');
    this.atencion.fecha = fecha;
    this.atencion.hora = hora.substring(0, 5); // HH:mm
  }
}



}
