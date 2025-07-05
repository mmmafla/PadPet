import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { ModalFechaComponent } from 'src/app/modal-fecha/modal-fecha.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-agregar-atencion-medica',
  templateUrl: './agregar-atencion-medica.page.html',
  styleUrls: ['./agregar-atencion-medica.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
})
export class AgregarAtencionMedicaPage implements OnInit {
  busquedaTutor = '';
  tutores: any[] = [];
  tutoresFiltrados: any[] = [];
  tutorSeleccionado: any = null;
  mascotaSeleccionada: any = null;

  estadoSensorial: any[] = [];
  nivelesHidratacion: any[] = [];
  tipoAlimentacion: any[] = [];

  tratamientoList: { nombre?: string; dosis: string; duracion: string; frecuencia?: string }[] = [];

  pielOpciones: any[] = [];
  ojosOpciones: any[] = [];
  oidosOpciones: any[] = [];
  dentaduraOpciones: any[] = [];
  sDigestivoOpciones: any[] = [];
  sCardioVascularOpciones: any[] = [];
  sRespiratorioOpciones: any[] = [];
  sUrinarioOpciones: any[] = [];
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
    obs_srespiratorio: '',
    id_surinario: null,
    obs_surinario: '',
    id_snervioso: null,
    obs_snervioso: '',
    id_slinfatico: null,
    obs_slinfatico: '',
    id_slocomotor: null,
    obs_slocomotor: '',
    id_sreproductor: null,
    obs_sreproductor: '',
    cantidad_alimentacion: null,
    veces_alimentacion: null,
    id_tipo_alimentacion: null,
  };

  constructor(
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      id_tutor?: string;
      id_mascota?: number;
      nombre_tutor?: string;
      nombre_mascota?: string;
    };

    await this.cargarTutores();
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

    // Seleccionar tutor y mascota automáticamente si se enviaron desde otra página
    if (state?.id_tutor && state?.id_mascota) {
      const tutor = this.tutores.find((t) => t.id_tutor === state.id_tutor);
      if (tutor) {
        this.tutorSeleccionado = tutor;
        this.busquedaTutor = `${tutor.nombre_tutor} ${tutor.apellidos_tutor || ''}`;
        this.tutoresFiltrados = [];

        const mascota = (tutor.mascota || []).find((m: any) => m.id_masc === state.id_mascota);
        if (mascota) {
          this.mascotaSeleccionada = mascota;
        } else {
          this.mascotaSeleccionada = { id_masc: state.id_mascota, masc_nom: state.nombre_mascota || '' };
        }
      }
    }
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
    this.tutores = tutores || [];
  }

  async cargarMotivosConsulta() {
    const { data, error } = await supabase.from('motivo_consulta').select('*');
    if (error) return console.error('Error al cargar motivos:', error);
    this.motivosConsulta = data || [];
  }

  async cargarEstadosSensoriales() {
    const { data, error } = await supabase.from('estado_sensorial').select('id_estado_sensorial, estado_sensorial');
    if (error) return console.error('Error al cargar estados sensoriales:', error);
    this.estadoSensorial = data || [];
  }

  async cargarNivelesHidratacion() {
    const { data, error } = await supabase.from('hidratacion').select('hidratacion_id, estado_hidratacion');
    if (error) return console.error('Error al cargar niveles de hidratación:', error);
    this.nivelesHidratacion = data || [];
  }

  async cargarTiposAlimentacion() {
    const { data, error } = await supabase.from('tipo_alimentacion').select('*');
    if (error) return console.error('Error al cargar tipo de alimentación:', error);
    this.tipoAlimentacion = data || [];
  }

  async cargarPielOpciones() {
    const { data, error } = await supabase.from('piel_obp').select('*');
    if (error) return console.error('Error al cargar Piel', error);
    this.pielOpciones = (data || []).sort((a, b) => a.estado_piel.localeCompare(b.estado_piel));
  }

  async cargarOjosOpciones() {
    const { data, error } = await supabase.from('ojos_obp').select('*');
    if (error) return console.error('Error al cargar Ojos', error);
    this.ojosOpciones = (data || []).sort((a, b) => a.estado_ojos.localeCompare(b.estado_ojos));
  }

  async cargarOidosOpciones() {
    const { data, error } = await supabase.from('oidos_obp').select('*');
    if (error) return console.error('Error al cargar Oidos', error);
    this.oidosOpciones = (data || []).sort((a, b) => a.estado_oidos.localeCompare(b.estado_oidos));
  }

  async cargarDentaduraOpciones() {
    const { data, error } = await supabase.from('dentadura_obp').select('*');
    if (error) return console.error('Error al cargar Dentadura', error);
    this.dentaduraOpciones = (data || []).sort((a, b) => a.estado_dentadura.localeCompare(b.estado_dentadura));
  }

  async cargarsDigestivoOpciones() {
    const { data, error } = await supabase.from('sdigestivo_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Digestivo', error);
    this.sDigestivoOpciones = (data || []).sort((a, b) => a.estado_sdigestivo.localeCompare(b.estado_sdigestivo));
  }

  async cargarsCardioVascularOpciones() {
    const { data, error } = await supabase.from('scvascular_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Cardio Vascular', error);
    this.sCardioVascularOpciones = (data || []).sort((a, b) => a.estado_scvascular.localeCompare(b.estado_scvascular));
  }

  async cargarSRespiratoorioOpciones() {
    const { data, error } = await supabase.from('srespiratorio_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Respiratorio', error);
    this.sRespiratorioOpciones = (data || []).sort((a, b) => a.estado_srespiratorio.localeCompare(b.estado_srespiratorio));
  }

  async cargarSUrinarioOpciones() {
    const { data, error } = await supabase.from('surinario_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Urinario', error);
    this.sUrinarioOpciones = (data || []).sort((a, b) => a.estado_surinario.localeCompare(b.estado_surinario));
  }

  async cargarsNerviocoOpciones() {
    const { data, error } = await supabase.from('snervioso_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Nervioso', error);
    this.sNerviosoOpciones = (data || []).sort((a, b) => a.estado_snervioso.localeCompare(b.estado_snervioso));
  }

  async cargarsLinfaticoOpciones() {
    const { data, error } = await supabase.from('slinfatico_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Linfático', error);
    this.sLinfaticoOpciones = (data || []).sort((a, b) => a.estado_slinfatico.localeCompare(b.estado_slinfatico));
  }

  async cargarsLocomotorOpciones() {
    const { data, error } = await supabase.from('slocomotor_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Locomotor', error);
    this.sLocomotorOpciones = (data || []).sort((a, b) => a.estado_slocomotor.localeCompare(b.estado_slocomotor));
  }

  async cargarsReproductorOpciones() {
    const { data, error } = await supabase.from('sreproductor_obp').select('*');
    if (error) return console.error('Error al cargar Sistema Reproductor', error);
    this.sReproductorOpciones = (data || []).sort((a, b) => a.estado_sreproductor.localeCompare(b.estado_sreproductor));
  }

  // ------------------------- Tutor y mascota -------------------------
  filtrarTutores() {
    const filtro = this.busquedaTutor.trim().toLowerCase();
    this.tutoresFiltrados = this.tutores.filter((tutor) =>
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

  // ------------------------- Tratamiento -------------------------
  agregarMedicamento() {
    this.tratamientoList.push({ nombre: '', dosis: '', duracion: '', frecuencia: '' });
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

  async abrirSelectorFecha() {
    // Convertir fecha si existe y está en formato dd-mm-yyyy
    let fechaISO: string | null = null;
    if (this.atencion.fecha) {
      const [dia, mes, anio] = this.atencion.fecha.split('-');
      fechaISO = `${anio}-${mes}-${dia}`;
    }

    const modal = await this.modalCtrl.create({
      component: ModalFechaComponent,
      componentProps: { fecha: fechaISO },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      // Convertir de vuelta a dd-mm-yyyy
      const [year, month, day] = data.fecha.split('-');
      this.atencion.fecha = `${day}-${month}-${year}`;
      this.atencion.hora = data.hora;
    }
  }

  asignarFechaHoraActual() {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    this.atencion.fecha = `${dia}-${mes}-${anio}`;
    this.atencion.hora = `${horas}:${minutos}`;
  }



  async guardarAtencion() {
    if (!this.tutorSeleccionado || !this.mascotaSeleccionada)
      return this.mostrarToast('Debes seleccionar un tutor y una mascota.', 'danger');
    if (!this.atencion.fecha || !this.atencion.hora || !this.atencion.motivo)
      return this.mostrarToast('Completa los campos obligatorios: fecha, hora y motivo.', 'danger');

    const runVet = await this.obtenerRunVet();
    if (!runVet) return this.mostrarToast('No se pudo identificar al veterinario.', 'danger');

    const fechaHoraAtencion = new Date(`${this.atencion.fecha}T${this.atencion.hora}`);

    const { data, error } = await supabase
      .from('atencion_medica')
      .insert([
        {
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
          id_tipo_alimentacion: this.atencion.id_tipo_alimentacion,
          cantidad_alimentacion: this.atencion.cantidad_alimentacion,
          veces_alimentacion: this.atencion.veces_alimentacion,
        },
      ])
      .select('id')
      .single();

    if (error || !data) {
      console.error('Error al insertar atención:', error);
      return this.mostrarToast('Hubo un error al guardar la atención.', 'danger');
    }

    // Guardar receta y detalle receta solo si hay medicamentos
    if (this.tratamientoList.length > 0) {
      await this.guardarRecetaEnBD(data.id);
    }

    this.mostrarToast('Atención médica guardada exitosamente.');
    this.reiniciarFormulario();
    this.router.navigate(['/atencion-medica']);
  }

  // ------------------------- Guardar receta y detalle receta -------------------------
  async guardarRecetaEnBD(idAtencion: number) {
    if (this.tratamientoList.length === 0) return;

    // 1. Insertar receta
    const { data: recetaData, error: recetaError } = await supabase
      .from('receta')
      .insert([
        {
          indicaciones: this.atencion.tratamiento_indicaciones || '',
          id_masc: this.mascotaSeleccionada.id_masc,
          fecha_receta: new Date().toISOString(),
          id_atencion_medica: idAtencion, // si tienes esa FK, opcional
        },
      ])
      .select('id_receta')
      .single();

    if (recetaError || !recetaData) {
      console.error('Error al insertar receta:', recetaError);
      this.mostrarToast('Error al guardar la receta.', 'danger');
      return;
    }

    const idReceta = recetaData.id_receta;

    // 2. Por cada medicamento en tratamientoList, verificar si existe en 'medicamento'
    //    Si no existe, insertarlo y obtener su id_medicamento
    //    Luego insertar en detalle_receta

    for (const med of this.tratamientoList) {
      if (!med.nombre || !med.dosis || !med.duracion) continue;

      // Verificar si medicamento existe
      const { data: medExistente, error: medError } = await supabase
        .from('medicamento')
        .select('id_medicamento')
        .eq('nombre_medicamento', med.nombre.trim())
        .limit(1)
        .single();

      let idMedicamento: number | null = null;

      if (medError) {
        // No existe medicamento, insertarlo
        const { data: medInsert, error: medInsertError } = await supabase
          .from('medicamento')
          .insert([{ nombre_medicamento: med.nombre.trim() }])
          .select('id_medicamento')
          .single();

        if (medInsertError || !medInsert) {
          console.error('Error al insertar medicamento:', medInsertError);
          this.mostrarToast(`Error al insertar medicamento ${med.nombre}`, 'danger');
          continue;
        }
        idMedicamento = medInsert.id_medicamento;
      } else {
        idMedicamento = medExistente.id_medicamento;
      }

      // Insertar en detalle_receta
      const { error: detalleError } = await supabase.from('detalle_receta').insert([
        {
          id_receta: idReceta,
          id_medicamento: idMedicamento,
          dosis_medicamento: med.dosis,
          duracion_medicamento: med.duracion,
          frecuencia_medicamento: med.frecuencia || null,
        },
      ]);

      if (detalleError) {
        console.error('Error al insertar detalle_receta:', detalleError);
        this.mostrarToast(`Error al guardar medicamento ${med.nombre} en la receta.`, 'danger');
      }
    }
  }

  reiniciarFormulario() {
    this.tutorSeleccionado = null;
    this.mascotaSeleccionada = null;
    this.busquedaTutor = '';
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
      obs_surinario: '',
      id_snervioso: null,
      obs_snervioso: '',
      id_slinfatico: null,
      obs_slinfatico: '',
      id_slocomotor: null,
      obs_slocomotor: '',
      id_sreproductor: null,
      obs_sreproductor: '',
      cantidad_alimentacion: null,
      veces_alimentacion: null,
      id_tipo_alimentacion: null,
    };
    this.tratamientoList = [];
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'bottom',
    });
    toast.present();
  }
}
