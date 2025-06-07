import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-datosatencion',
  templateUrl: './datosatencion.page.html',
  styleUrls: ['./datosatencion.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, ReactiveFormsModule, CommonModule, HeaderComponent]
})
export class DatosatencionPage implements OnInit {
  supabase = inject(SupabaseService);
  toastController = inject(ToastController);

  especies: any[] = [];
  especiesSeleccionadas: string[] = [];

  examenes: any[] = [];
  examenesSeleccionados: string[] = [];

  muestras: any[] = [];
  muestrasSeleccionadas: string[] = [];

  id_usuario: string = '';

  ngOnInit() {
    this.obtenerUsuario();
    this.cargarEspecies();
    this.cargarExamenes();
    this.cargarMuestras();
  }

  async obtenerUsuario() {
    const { data } = await this.supabase.auth.getUser();
    if (data?.user) {
      this.id_usuario = data.user.id;
    }
  }

  async cargarEspecies() {
    const { data, error } = await this.supabase.from('tipo_especie').select('*');
    if (error) {
      this.mostrarToast('Error al cargar especies', 'danger');
      return;
    }
    this.especies = data;
  }

  async cargarExamenes() {
    const { data, error } = await this.supabase.from('tipo_examen').select('*');
    if (error) {
      this.mostrarToast('Error al cargar exámenes', 'danger');
      return;
    }
    this.examenes = data;
  }

  async cargarMuestras() {
    const { data, error } = await this.supabase.from('tipo_muestra_medica').select('*');
    if (error) {
      this.mostrarToast('Error al cargar muestras médicas', 'danger');
      return;
    }
    this.muestras = data;
  }

  toggleItem(lista: string[], id: string): string[] {
    return lista.includes(id) ? lista.filter(i => i !== id) : [...lista, id];
  }

  toggleEspecie(id: string) {
    this.especiesSeleccionadas = this.toggleItem(this.especiesSeleccionadas, id);
  }

  toggleExamen(id: string) {
    this.examenesSeleccionados = this.toggleItem(this.examenesSeleccionados, id);
  }

  toggleMuestra(id: string) {
    this.muestrasSeleccionadas = this.toggleItem(this.muestrasSeleccionadas, id);
  }

  async guardarEspecies() {
    try {
      const { data: existe, error } = await this.supabase
        .from('preferencias_atencion')
        .select('id_preferencias_atencion, id_examen, id_muestra')
        .eq('id_auth', this.id_usuario)
        .single();

      const payload = {
        id_auth: this.id_usuario,
        id_especie: this.especiesSeleccionadas.length > 0 ? this.especiesSeleccionadas : null,
        id_examen: existe?.id_examen ?? null,
        id_muestra: existe?.id_muestra ?? null
      };

      console.log('Payload (guardarEspecies):', payload);

      const { error: errorInsert } = existe
        ? await this.supabase.from('preferencias_atencion').update(payload).eq('id_auth', this.id_usuario)
        : await this.supabase.from('preferencias_atencion').insert(payload);

      if (errorInsert) throw errorInsert;

      this.mostrarToast('Especies guardadas correctamente');
    } catch (error: any) {
      console.error('Error guardarEspecies:', error.message || error);
      this.mostrarToast('Error al guardar especies: ' + error.message, 'danger');
    }
  }

  async guardarExamenes() {
    try {
      const { data: existe, error } = await this.supabase
        .from('preferencias_atencion')
        .select('id_preferencias_atencion, id_especie, id_muestra')
        .eq('id_auth', this.id_usuario)
        .single();

      const payload = {
        id_auth: this.id_usuario,
        id_especie: existe?.id_especie ?? null,
        id_examen: this.examenesSeleccionados.length > 0 ? this.examenesSeleccionados : null,
        id_muestra: existe?.id_muestra ?? null
      };

      console.log('Payload (guardarExamenes):', payload);

      const { error: errorInsert } = existe
        ? await this.supabase.from('preferencias_atencion').update(payload).eq('id_auth', this.id_usuario)
        : await this.supabase.from('preferencias_atencion').insert(payload);

      if (errorInsert) throw errorInsert;

      this.mostrarToast('Exámenes guardados correctamente');
    } catch (error: any) {
      console.error('Error guardarExamenes:', error.message || error);
      this.mostrarToast('Error al guardar exámenes: ' + error.message, 'danger');
    }
  }

  async guardarMuestras() {
    try {
      const { data: existe, error } = await this.supabase
        .from('preferencias_atencion')
        .select('id_preferencias_atencion, id_especie, id_examen')
        .eq('id_auth', this.id_usuario)
        .single();

      const payload = {
        id_auth: this.id_usuario,
        id_especie: existe?.id_especie ?? null,
        id_examen: existe?.id_examen ?? null,
        id_muestra: this.muestrasSeleccionadas.length > 0 ? this.muestrasSeleccionadas : null
      };

      console.log('Payload (guardarMuestras):', payload);

      const { error: errorInsert } = existe
        ? await this.supabase.from('preferencias_atencion').update(payload).eq('id_auth', this.id_usuario)
        : await this.supabase.from('preferencias_atencion').insert(payload);

      if (errorInsert) throw errorInsert;

      this.mostrarToast('Muestras guardadas correctamente');
    } catch (error: any) {
      console.error('Error guardarMuestras:', error.message || error);
      this.mostrarToast('Error al guardar muestras: ' + error.message, 'danger');
    }
  }

  private async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
