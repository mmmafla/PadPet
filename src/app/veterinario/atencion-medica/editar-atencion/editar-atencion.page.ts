import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController} from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);


@Component({
  selector: 'app-editar-atencion',
  templateUrl: './editar-atencion.page.html',
  styleUrls: ['./editar-atencion.page.scss'],
      standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent] 
})
export class EditarAtencionPage implements OnInit {

  atencion: any;
  estadoSensorial: any[] = [];
  nivelesHidratacion: any[] = [];
  motivosDisponibles: any[] = [];

  tipoAlimentacionOpciones: any[] = [];
  pielOpciones: any[] = [];
  ojosOpciones: any[] =[];
  oidosOpciones: any[] = [];
  dentaduraOpciones: any[] = [];

  tratamientoList: any[] = [];
  sDigestivoOpciones: any[] =[];
  sCardioVascularOpciones: any[] = [];
  sRespiratorioOpciones: any[] = [];
  sUrinarioOpciones: any [] = [];
  sNerviosoOpciones: any[] = [];
  sLinfaticoOpciones: any[] = [];
  sLocomotorOpciones: any[] = [];
  sReproductorOpciones: any[] = [];


constructor(
      private router: Router,
      private toastController: ToastController
) {
  const nav = this.router.getCurrentNavigation();
  this.atencion = nav?.extras?.state?.['atencion'];
}


async ngOnInit() {
  await this.cargarMotivosConsulta();
  await this.cargarNivelesHidratacion();
  await this.cargarestadoSensorial();

  await this.cargarPielOpciones();
  await this.cargarOjosOpciones();
  await this.cargarOidosOpciones();
  await this.cargarDentaduraOpciones();
  await this.cargarsDigestivoOpciones();
  await this.cargarsCardioVascularOpciones();
  await this.cargarSRespiratoorioOpciones();
  await this.cargarSUrinarioOpciones();
  await this.cargarsNerviocoOpciones();
  await this.cargarsLinfaticoOpciones();
  await this.cargarsLocomotorOpciones();
  await this.cargarsReproductorOpciones();
  await this.cargarTipoAlimentacion();


}

async cargarestadoSensorial(){
    const { data, error } = await supabase
    .from('estado_sensorial')
    .select('*')
    .order('estado_sensorial', { ascending: true });

  if (error) {
    console.error('Error cargando estado sensorial :', error.message);
  } else {
    this.estadoSensorial = data;
  }

}

async cargarNivelesHidratacion() {
  const { data, error } = await supabase
    .from('hidratacion')
    .select('*')
    .order('estado_hidratacion', { ascending: true });

  if (error) {
    console.error('Error cargando niveles de hidratación:', error.message);
  } else {
    this.nivelesHidratacion = data;
  }
}

async cargarMotivosConsulta() {
  const { data, error } = await supabase
    .from('motivo_consulta')
    .select('id, motivo')
    .order('motivo', { ascending: true });

  if (error) {
    console.error('Error al cargar motivos:', error);
    return;
  }

  this.motivosDisponibles = data || [];
}

async cargarTipoAlimentacion(){
    const { data, error } = await supabase.from('tipo_alimentacion').select('*');
    if (error) return console.error('Error al cargar el tipo de alimentacion', error);
    this.tipoAlimentacionOpciones =  data.sort((a, b) => a.tipo_alimentacion.localeCompare(b.tipo_alimentacion));

}

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
    if (error) return console.error('Error al cargar ioSistema Reproductor', error);
    this.sReproductorOpciones = data.sort((a, b) => a.estado_sreproductor.localeCompare(b.estado_sreproductor));


   }



async guardarCambios() {
  if (!this.atencion || !this.atencion.id) {
    console.error('No hay atención médica válida para actualizar.');
    return;
  }

  const { error } = await supabase
    .from('atencion_medica')
    .update({
      motivo_id: this.atencion.motivo_id,
      anamnesis: this.atencion.anamnesis,
      diagnostico: this.atencion.diagnostico,
      observaciones: this.atencion.observaciones,
      mucosa: this.atencion.mucosa,
      temperatura: this.atencion.temperatura,
      peso: this.atencion.peso,
      condicion_corporal: this.atencion.condicion_corporal,
      observacion_examen: this.atencion.observacion_examen,
      estado_sensorial_id: this.atencion.estado_sensorial_id,
      hidratacion_id: this.atencion.hidratacion_id,

      id_tipo_alimentacion: this.atencion.id_tipo_alimentacion,
      cantidad_alimentacion: this.atencion.cantidad_alimentacion,
      veces_alimentacion: this.atencion.veces_alimentacion,
      
      id_piel: this.atencion.id_piel,
      obs_piel: this.atencion.obs_piel,
      id_ojos: this.atencion.id_ojos,
      obs_ojos: this.atencion.obs_ojos,
      id_oidos: this.atencion.id_oidos,
      obs_oidos: this.atencion.obs_oidos,
      id_dentadura: this.atencion.id_dentadura,
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
    })
    .eq('id', this.atencion.id);

  if (error) {
    console.error('Error al actualizar la atención médica:', error.message);
    this.mostrarToast('Error al guardar los cambios');
    return;
  }

  this.mostrarToast('Cambios actualizados correctamente');
   this.router.navigate(['/detalle-atencion']); 
   
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
