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

@Component({
  selector: 'app-modificar-receta',
  templateUrl: './modificar-receta.page.html',
  styleUrls: ['./modificar-receta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class ModificarRecetaPage implements OnInit {
  idReceta: number;

  receta: any;

  tratamiento_indicaciones: string = '';
  tratamientoList: { id_medicamento: number | null; dosis: string; duracion: string }[] = [];
  medicamentosDisponibles: any[] = [];

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    this.idReceta = nav?.extras?.state?.['id'];
  }

  async ngOnInit() {
    await this.cargarMedicamentos();
    if (this.idReceta) {
      await this.cargarDatosReceta(this.idReceta);
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

  async cargarDatosReceta(id: number) {
    const { data, error } = await supabase
      .from('receta')
      .select(`
        id_receta,
        indicaciones,
        id_masc,
        mascota:mascota(masc_nom),
        detalle_receta (
          id_medicamento,
          dosis_medicamento,
          duracion_medicamento
        )
      `)
      .eq('id_receta', id)
      .single();

    if (error || !data) {
      this.mostrarToast('Error al cargar la receta', 'danger');
      return;
    }

    this.receta = data;
    this.tratamiento_indicaciones = data.indicaciones;
    this.tratamientoList = data.detalle_receta.map((detalle: any) => ({
      id_medicamento: detalle.id_medicamento,
      dosis: detalle.dosis_medicamento,
      duracion: detalle.duracion_medicamento
    }));
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
      position: 'middle'
    });
    toast.present();
  }

  async guardarCambios() {
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
      header: '¿Confirmar cambios?',
      message: 'Se modificarán las indicaciones y medicamentos de esta receta.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', handler: () => this.actualizarRecetaEnBD() }
      ]
    });

    await alert.present();
  }

  async actualizarRecetaEnBD() {
    // Actualizar indicaciones
    const { error: updateError } = await supabase
      .from('receta')
      .update({ indicaciones: this.tratamiento_indicaciones })
      .eq('id_receta', this.idReceta);

    if (updateError) {
      console.error(updateError);
      return this.mostrarToast('No se pudo actualizar la receta', 'danger');
    }

    // Eliminar detalles anteriores
    const { error: deleteError } = await supabase
      .from('detalle_receta')
      .delete()
      .eq('id_receta', this.idReceta);

    if (deleteError) {
      console.error(deleteError);
      return this.mostrarToast('No se pudieron limpiar los medicamentos', 'danger');
    }

    // Insertar nuevos detalles
    const nuevosDetalles = this.tratamientoList.map(med => ({
      id_receta: this.idReceta,
      id_medicamento: med.id_medicamento,
      dosis_medicamento: med.dosis,
      duracion_medicamento: med.duracion
    }));

    const { error: insertError } = await supabase
      .from('detalle_receta')
      .insert(nuevosDetalles);

    if (insertError) {
      console.error(insertError);
      return this.mostrarToast('Error al guardar nuevos medicamentos', 'danger');
    }

    this.mostrarToast('Receta actualizada correctamente');
    this.router.navigate(['/veterinario/recetas/detalle-receta'], {
      state: { id: this.idReceta }
    });
  }

  // Nueva función para eliminar receta
  async eliminarReceta() {
    const alert = await this.alertController.create({
      header: '¿Eliminar receta?',
      message: 'Esta acción no se puede deshacer. ¿Deseas eliminar esta receta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.confirmarEliminar() }
      ]
    });

    await alert.present();
  }

  private async confirmarEliminar() {
    // Primero eliminar detalles de receta (dependencias)
    const { error: deleteDetallesError } = await supabase
      .from('detalle_receta')
      .delete()
      .eq('id_receta', this.idReceta);

    if (deleteDetallesError) {
      console.error(deleteDetallesError);
      return this.mostrarToast('Error al eliminar detalles de la receta', 'danger');
    }

    // Luego eliminar la receta
    const { error: deleteRecetaError } = await supabase
      .from('receta')
      .delete()
      .eq('id_receta', this.idReceta);

    if (deleteRecetaError) {
      console.error(deleteRecetaError);
      return this.mostrarToast('Error al eliminar la receta', 'danger');
    }

    this.mostrarToast('Receta eliminada correctamente', 'success');
    // Navegar a la lista de recetas después de eliminar
    this.router.navigate(['/recetas']);
  }
}
