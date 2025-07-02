import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  tipoAlimentacion:any[] = [];

  tratamientoList: any[] = [];

  pielOpciones: any[] = [];
  ojosOpciones: any[] = [];
  oidosOpciones: any[] = [];
  dentaduraOpciones: any[] = [];
  sDigestivoOpciones: any[] =[];
  sCardioVascularOpciones: any[] = [];
  sRespiratorioOpciones: any[] = [];
  sUrinarioOpciones: any [] = [];
  sNerviosoOpciones: any[] = [];
  sLinfaticoOpciones: any[] = [];
  sLocomotorOpciones: any[] = [];
  sReproductorOpciones: any[] = [];

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
    obs_piel: '',
    id_ojos: null,
    obs_ojos: '',
    id_oidos: null,
    obs_oidos: '',
    id_dentadura: null,
    obs_dentadura: '',
    id_sdigestivo: null,
    obs_sdigestivo: '',
    id_scvascular: null,
    obs_scvascular: '',
    id_srespiratorio: null,
    obs_srespiratorio:'',
    id_surinario: null,
    obs_surinario:'',
    id_snervioso:null,
    obs_snervioso:'',
    id_slinfatico: null,
    obs_slinfatico:'',
    id_slocomotor: null,
    obs_slocomotor:'',
    id_sreproductor:null,
    obs_sreproductor:'',
    cantidad_alimentacion: null,
    veces_alimentacion: null,
    id_tipo_alimentacion: null,

  };



  constructor(
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private router: Router,
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
    this.cargarsDigestivoOpciones();
    this.cargarsCardioVascularOpciones();
    this.cargarSRespiratoorioOpciones();
    this.cargarSUrinarioOpciones();
    this.cargarsNerviocoOpciones();
    this.cargarsLinfaticoOpciones();
    this.cargarsLocomotorOpciones();
    this.cargarsReproductorOpciones();
    this.cargarTiposAlimentacion();

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


async cargarTiposAlimentacion() {
    const { data, error } = await supabase.from('tipo_alimentacion').select('*');
    if (error) return console.error('Error al cargar tipo de alimentación:', error);
    this.tipoAlimentacion = data;
  }


  //--------------------------------------
  async cargarPielOpciones() {
    const { data, error } = await supabase.from('piel_obp').select('*');
    if (error) return console.error('Error al cargar Piel', error);
    this.pielOpciones =  data.sort((a, b) => a.estado_piel.localeCompare(b.estado_piel));
  }

  async cargarOjosOpciones() {
    const { data, error } = await supabase.from('ojos_obp').select('*');
    if (error) return console.error('Error al cargar Ojos', error);
    this.ojosOpciones = data.sort((a, b) => a.estado_ojos.localeCompare(b.estado_ojos));
  }

  async cargarOidosOpciones() {
    const { data, error } = await supabase.from('oidos_obp').select('*');
    if (error) return console.error('Error al cargar Oidos', error);
    this.oidosOpciones = data.sort((a, b) => a.estado_oidos.localeCompare(b.estado_oidos));
  }

  async cargarDentaduraOpciones() {
    const { data, error } = await supabase.from('dentadura_obp').select('*');
    if (error) return console.error('Error al cargar Dentadura', error);
    this.dentaduraOpciones = data.sort((a, b) => a.estado_dentadura.localeCompare(b.estado_dentadura));
  }

    async cargarsDigestivoOpciones() {
    const { data, error } = await supabase.from('sdigestivo_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Digestivo', error);
    this.sDigestivoOpciones = data.sort((a, b) => a.estado_sdigestivo.localeCompare(b.estado_sdigestivo));
  }

      async cargarsCardioVascularOpciones() {
    const { data, error } = await supabase.from('scvascular_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Cardio Vascular', error);
    this.sCardioVascularOpciones = data.sort((a, b) => a.estado_scvascular.localeCompare(b.estado_scvascular));
  }

    async cargarSRespiratoorioOpciones() {
    const { data, error } = await supabase.from('srespiratorio_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Respiratorio', error);
    this.sRespiratorioOpciones = data.sort((a, b) => a.estado_srespiratorio.localeCompare(b.estado_srespiratorio));
  }

    async cargarSUrinarioOpciones() {
    const { data, error } = await supabase.from('surinario_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Urinario', error);
    this.sUrinarioOpciones = data.sort((a, b) => a.estado_surinario.localeCompare(b.estado_surinario));
  }

  async cargarsNerviocoOpciones() {
    const { data, error } = await supabase.from('snervioso_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Nervioso', error);
    this.sNerviosoOpciones = data.sort((a, b) => a.estado_snervioso.localeCompare(b.estado_snervioso));
  }

   async cargarsLinfaticoOpciones(){
        const { data, error } = await supabase.from('slinfatico_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Linfático', error);
    this.sLinfaticoOpciones = data.sort((a, b) => a.estado_slinfatico.localeCompare(b.estado_slinfatico));

   }
   async cargarsLocomotorOpciones(){
        const { data, error } = await supabase.from('slocomotor_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Locomotor', error);
    this.sLocomotorOpciones = data.sort((a, b) => a.estado_slocomotor.localeCompare(b.estado_slocomotor));

   }
   async cargarsReproductorOpciones(){
        const { data, error } = await supabase.from('sreproductor_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Reproductor', error);
    this.sReproductorOpciones = data.sort((a, b) => a.estado_sreproductor.localeCompare(b.estado_sreproductor));


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
    if (!this.tutorSeleccionado || !this.mascotaSeleccionada)
      return this.mostrarToast('Debes seleccionar un tutor y una mascota.');
    if (!this.atencion.fecha || !this.atencion.hora || !this.atencion.motivo)
      return this.mostrarToast('Completa los campos obligatorios: fecha, hora y motivo.');

    const runVet = await this.obtenerRunVet();
    if (!runVet) return this.mostrarToast('No se pudo identificar al veterinario.');

    const fechaHoraAtencion = new Date(`${this.atencion.fecha}T${this.atencion.hora}`);



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
      obs_piel: this.atencion.obs_piel,
      obs_ojos: this.atencion.obs_ojos,
      obs_oidos: this.atencion.obs_oidos,
      obs_dentadura: this.atencion.obs_dentadura,
      // Sistemas
      id_sdigestivo: this.atencion.id_sdigestivo,
        obs_sdigestivo: this.atencion.obs_sdigestivo,
      id_scvascular: this.atencion.id_scvascular,
        obs_scvascular: this.atencion.obs_scvascular,
      id_srespiratorio: this.atencion.id_srespiratorio,
        obs_srespiratorio: this.atencion.obs_srespiratorio,
      id_surinario: this.atencion.id_surinario,
        obs_surinario: this.atencion.obs_surinario,
      id_snervioso: this.atencion.id_snervioso,
        obs_snervioso: this.atencion.obs_snervioso,
      id_slinfatico: this.atencion.id_slinfatico,
        obs_slinfatico: this.atencion.obs_slinfatico,
      id_slocomotor: this.atencion.id_slocomotor,
        obs_slocomotor: this.atencion.obs_slocomotor,
      id_sreproductor: this.atencion.id_sreproductor,
        obs_sreproductor: this.atencion.obs_sreproductor,

      // Alimentación 
      id_tipo_alimentacion: this.atencion.id_tipo_alimentacion,
      cantidad_alimentacion: this.atencion.cantidad_alimentacion,
      veces_alimentacion: this.atencion.veces_alimentacion,


    }]);

    if (error) {
      console.error('Error al insertar atención:', error);
      return this.mostrarToast('Hubo un error al guardar la atención.');
    }

    this.mostrarToast('Atención médica guardada exitosamente.');
    this.reiniciarFormulario();
    this.router.navigate(['/atencion-medica']);
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
      obs_piel: '',
      id_ojos: null,
      obs_ojos: '',
      id_oidos: null,
      obs_oidos: '',
      id_dentadura: null,
      obs_dentadura: '',
      id_sdigestivo: null,
      obs_sdigestivo: '',
      id_scvascular: null,
      obs_scvascular: '',
      id_srespiratorio: null,
      obs_srespiratorio: '',
      id_surinario: null,
      obs_surinario:'',
      id_snervioso:null,
      obs_snervioso:'',
      id_slinfatico: null,
      obs_slinfatico:'',
      id_slocomotor: null,
      obs_slocomotor:'',
      id_sreproductor:null,
      obs_sreproductor:'',
      cantidad_alimentacion: null,
      veces_alimentacion: null,
      id_tipo_alimentacion: null,

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