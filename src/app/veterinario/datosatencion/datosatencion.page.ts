import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormularioComponent } from 'src/app/componentes/formulario/formulario.component';
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


  ngOnInit() {
    this.cargarEspecies();
    this.cargarExamenes();
    this.cargarMuestras();
  }

  async cargarEspecies() {
    const { data, error } = await this.supabase
      .from('tipo_especie')
      .select('*');

    if (error) {
      console.error('Error al cargar especies:', error.message);
      this.mostrarToast('Error al cargar especies', 'danger');
      return;
    }

    this.especies = data;
  }
  async cargarExamenes() {
    const { data, error } = await this.supabase
      .from('tipo_examen')
      .select('*');

    if (error) {
      console.error('Error al cargar exámenes:', error.message);
      this.mostrarToast('Error al cargar exámenes', 'danger');
      return;
    }

    this.examenes = data;
  }

  async cargarMuestras() {
  const { data, error } = await this.supabase
    .from('tipo_muestra_medica')
    .select('*');

  if (error) {
    console.error('Error al cargar muestras médicas:', error.message);
    this.mostrarToast('Error al cargar muestras médicas', 'danger');
    return;
  }

  this.muestras = data;
}

  toggleEspecie(id: string) {
    if (this.especiesSeleccionadas.includes(id)) {
      this.especiesSeleccionadas = this.especiesSeleccionadas.filter(e => e !== id);
    } else {
      this.especiesSeleccionadas.push(id);
    }
  }

  toggleExamen(id: string) {
    if (this.examenesSeleccionados.includes(id)) {
      this.examenesSeleccionados = this.examenesSeleccionados.filter(e => e !== id);
    } else {
      this.examenesSeleccionados.push(id);
    }
  }

  toggleMuestra(id: string) {
  if (this.muestrasSeleccionadas.includes(id)) {
    this.muestrasSeleccionadas = this.muestrasSeleccionadas.filter(m => m !== id);
  } else {
    this.muestrasSeleccionadas.push(id);
  }
}


  async guardarEspecies() {
    console.log('Especies seleccionadas:', this.especiesSeleccionadas);
    this.mostrarToast('Especies guardadas (simulado)', 'success');
    // Aquí podrías hacer un insert/update en Supabase
  }

    async guardarExamenes() {
    console.log('Exámenes seleccionados:', this.examenesSeleccionados);
    this.mostrarToast('Exámenes guardados (simulado)', 'success');
  }

  async guardarMuestras() {
  console.log('Muestras seleccionadas:', this.muestrasSeleccionadas);
  this.mostrarToast('Muestras guardadas (simulado)', 'success');
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
