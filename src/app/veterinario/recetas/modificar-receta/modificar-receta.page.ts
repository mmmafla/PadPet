import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  idReceta!: number;
  receta: any;
  tratamiento_indicaciones: string = '';
  tratamientoList: { nombre: string; dosis: string; duracion: string; frecuencia: string }[] = [];
  runVet: string | null = null;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute  // <-- Inyectamos ActivatedRoute
  ) {}

  async ngOnInit() {
    // Obtener id_receta desde la URL
    this.idReceta = Number(this.route.snapshot.paramMap.get('id_receta'));

    if (!this.idReceta) {
      this.mostrarToast('No se especificó id de receta', 'danger');
      return;
    }

    await this.obtenerRunVet();

    if (this.idReceta) {
      await this.cargarDatosReceta(this.idReceta);
    }
  }

  async obtenerRunVet() {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      console.error('No se pudo obtener user.id desde la sesión:', sessionError);
      await this.mostrarToast('No se pudo identificar al usuario', 'danger');
      return;
    }

    const { data, error } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', userId)
      .single();

    if (error || !data) {
      console.error('Error obteniendo run_vet:', error);
      await this.mostrarToast('Error obteniendo datos del veterinario', 'danger');
      return;
    }

    this.runVet = data.run_vet;
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
          dosis_medicamento,
          duracion_medicamento,
          frecuencia_medicamento,
          medicamento (
            nombre_medicamento
          )
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
      nombre: detalle.medicamento?.nombre_medicamento || '',
      dosis: detalle.dosis_medicamento,
      duracion: detalle.duracion_medicamento,
      frecuencia: detalle.frecuencia_medicamento || ''
    }));
  }

  agregarMedicamento() {
    this.tratamientoList.push({ nombre: '', dosis: '', duracion: '', frecuencia: '' });
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

  async guardarCambiosReceta() {
    if (!this.runVet) {
      return this.mostrarToast('No se pudo obtener identificación del veterinario', 'danger');
    }

    if (this.tratamientoList.length === 0) {
      return this.mostrarToast('Agrega al menos un medicamento', 'warning');
    }

    for (const med of this.tratamientoList) {
      if (!med.nombre.trim()) {
        return this.mostrarToast('El nombre del medicamento es obligatorio', 'warning');
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

  async insertarOMedicamento(nombre: string): Promise<number | null> {
    const { data: existente, error: errorBusqueda } = await supabase
      .from('medicamento')
      .select('id_medicamento')
      .ilike('nombre_medicamento', nombre.trim())
      .maybeSingle();

    if (errorBusqueda) {
      console.error('Error buscando medicamento:', errorBusqueda);
      return null;
    }

    if (existente) return existente.id_medicamento;

    const { data: insertado, error: errorInsert } = await supabase
      .from('medicamento')
      .insert({ nombre_medicamento: nombre.trim() })
      .select('id_medicamento')
      .single();

    if (errorInsert) {
      console.error('Error insertando medicamento:', errorInsert);
      return null;
    }

    return insertado.id_medicamento;
  }

  async actualizarRecetaEnBD() {
    const { error: updateError } = await supabase
      .from('receta')
      .update({ indicaciones: this.tratamiento_indicaciones })
      .eq('id_receta', this.idReceta);

    if (updateError) {
      console.error(updateError);
      return this.mostrarToast('No se pudo actualizar la receta', 'danger');
    }

    const { error: deleteError } = await supabase
      .from('detalle_receta')
      .delete()
      .eq('id_receta', this.idReceta);

    if (deleteError) {
      console.error(deleteError);
      return this.mostrarToast('Error al limpiar medicamentos previos', 'danger');
    }

    const nuevosDetalles: any[] = [];

    for (const med of this.tratamientoList) {
      const idMedicamento = await this.insertarOMedicamento(med.nombre);
      if (!idMedicamento) continue;

      nuevosDetalles.push({
        id_receta: this.idReceta,
        id_medicamento: idMedicamento,
        dosis_medicamento: med.dosis,
        duracion_medicamento: med.duracion,
        frecuencia_medicamento: med.frecuencia
      });
    }

    if (nuevosDetalles.length === 0) {
      return this.mostrarToast('No se pudieron insertar los medicamentos', 'danger');
    }

    const { error: insertError } = await supabase
      .from('detalle_receta')
      .insert(nuevosDetalles);

    if (insertError) {
      console.error(insertError);
      return this.mostrarToast('Error al guardar nuevos medicamentos', 'danger');
    }

    this.mostrarToast('Receta actualizada correctamente');

    // Cambio aquí para navegar a detalle-atencion
    this.router.navigate(['/detalle-atencion'], {
      state: { id_receta: this.idReceta }
    });
  }

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
    const { error: deleteDetallesError } = await supabase
      .from('detalle_receta')
      .delete()
      .eq('id_receta', this.idReceta);

    if (deleteDetallesError) {
      console.error(deleteDetallesError);
      return this.mostrarToast('Error al eliminar detalles de la receta', 'danger');
    }

    const { error: deleteRecetaError } = await supabase
      .from('receta')
      .delete()
      .eq('id_receta', this.idReceta);

    if (deleteRecetaError) {
      console.error(deleteRecetaError);
      return this.mostrarToast('Error al eliminar la receta', 'danger');
    }

    this.mostrarToast('Receta eliminada correctamente', 'success');
    this.router.navigate(['/home']);
  }
}
