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
  imports: [
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent
  ]
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

  id_usuario: string = ''; // auth user id

  async ngOnInit() {
    await this.ionViewWillEnter();
  }

  async ionViewWillEnter() {
    await this.obtenerUsuario();
    await this.cargarEspecies();
    await this.cargarExamenes();
    await this.cargarMuestras();
    await this.cargarSeleccionadas();
  }

  private async obtenerUsuario() {
    const { data } = await this.supabase.auth.getUser();
    if (data?.user) {
      this.id_usuario = data.user.id;
    }
  }

  private async cargarEspecies() {
    const { data, error } = await this.supabase.from('especie').select('*');
    if (error) return this.mostrarToast('Error al cargar especies', 'danger');
    this.especies = data;
  }

  private async cargarExamenes() {
    const { data, error } = await this.supabase.from('tipo_examen').select('*');
    if (error) return this.mostrarToast('Error al cargar exámenes', 'danger');
    this.examenes = data;
  }

  private async cargarMuestras() {
    const { data, error } = await this.supabase.from('tipo_muestra_medica').select('*');
    if (error) return this.mostrarToast('Error al cargar muestras médicas', 'danger');
    this.muestras = data;
  }

  toggleItem(lista: string[], id: string): string[] {
    return lista.includes(id)
      ? lista.filter(i => i !== id)
      : [...lista, id];
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
      await this.supabase
        .from('preferencia_especie')
        .delete()
        .eq('id_auth', this.id_usuario);

      const registros = this.especiesSeleccionadas.map(id => ({
        id_auth: this.id_usuario,
        id_especie: id
      }));

      if (registros.length > 0) {
        const { error } = await this.supabase
          .from('preferencia_especie')
          .insert(registros);
        if (error) throw error;
      }

      this.mostrarToast('Especies guardadas correctamente');
    } catch (error: any) {
      console.error('Error guardarEspecies:', error.message || error);
      this.mostrarToast('Error al guardar especies: ' + error.message, 'danger');
    }
  }

  async guardarExamenes() {
    try {
      await this.supabase
        .from('preferencia_examen')
        .delete()
        .eq('id_auth', this.id_usuario);

      const registros = this.examenesSeleccionados.map(id => ({
        id_auth: this.id_usuario,
        id_examen: id
      }));

      if (registros.length > 0) {
        const { error } = await this.supabase
          .from('preferencia_examen')
          .insert(registros);
        if (error) throw error;
      }

      this.mostrarToast('Exámenes guardados correctamente');
    } catch (error: any) {
      console.error('Error guardarExamenes:', error.message || error);
      this.mostrarToast('Error al guardar exámenes: ' + error.message, 'danger');
    }
  }

  async guardarMuestras() {
    try {
      await this.supabase
        .from('preferencia_muestra')
        .delete()
        .eq('id_auth', this.id_usuario);

      const registros = this.muestrasSeleccionadas.map(id => ({
        id_auth: this.id_usuario,
        id_muestra: id
      }));

      if (registros.length > 0) {
        const { error } = await this.supabase
          .from('preferencia_muestra')
          .insert(registros);
        if (error) throw error;
      }

      this.mostrarToast('Muestras guardadas correctamente');
    } catch (error: any) {
      console.error('Error guardarMuestras:', error.message || error);
      this.mostrarToast('Error al guardar muestras: ' + error.message, 'danger');
    }
  }

  private async cargarSeleccionadas() {
    const [especies, examenes, muestras] = await Promise.all([
      this.supabase
        .from('preferencia_especie')
        .select('id_especie')
        .eq('id_auth', this.id_usuario),

      this.supabase
        .from('preferencia_examen')
        .select('id_examen')
        .eq('id_auth', this.id_usuario),

      this.supabase
        .from('preferencia_muestra')
        .select('id_muestra')
        .eq('id_auth', this.id_usuario)
    ]);

    if (especies.data) {
      this.especiesSeleccionadas = especies.data.map(e => e.id_especie);
    }

    if (examenes.data) {
      this.examenesSeleccionados = examenes.data.map(e => e.id_examen);
    }

    if (muestras.data) {
      this.muestrasSeleccionadas = muestras.data.map(e => e.id_muestra);
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
