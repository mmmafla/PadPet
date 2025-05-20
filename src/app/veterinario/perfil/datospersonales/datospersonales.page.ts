import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-datospersonales',
  templateUrl: './datospersonales.page.html',
  styleUrls: ['./datospersonales.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, HeaderComponent]
})
export class DatospersonalesPage implements OnInit {

  form: FormGroup;
  regiones: any[] = [];

  supabase = inject(SupabaseService);
  toastController = inject(ToastController);
  router = inject(Router);

  constructor() {
    this.form = new FormGroup({
      nombre_vet: new FormControl('', [Validators.required]),
      apellidos_vet: new FormControl('', [Validators.required]),
      email_vet: new FormControl('', [Validators.required, Validators.email]),
      run_vet: new FormControl({ value: '', disabled: true }),
      celular_vet: new FormControl('', [Validators.required]),
      direccion_vet: new FormControl('', [Validators.required]),
      id_region: new FormControl(null, [Validators.required]) // null para mejor compatibilidad con ion-select
    });
  }

  async ngOnInit() {
    await this.cargarRegiones();              // Primero cargar regiones
    await this.cargarDatosVeterinario();      // Luego los datos del veterinario
  }

  async cargarRegiones() {
    try {
      const { data, error } = await this.supabase
        .from('region')
        .select('id_region, nombre_region');

      if (error) {
        console.error('Error al obtener las regiones:', error);
        return;
      }

      console.log('Regiones obtenidas:', data); // DEBUG

      if (data) {
        this.regiones = data;
        console.log('Regiones cargadas:', this.regiones); // Confirmación
      }
    } catch (error) {
      console.error('Error en la consulta de regiones:', error);
    }
  }

  async cargarDatosVeterinario() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        console.error('Error al obtener el usuario:', error);
        return;
      }

      if (!user) {
        console.warn('No se encontró un usuario autenticado.');
        return;
      }

      const { data, error: vetError } = await this.supabase
        .from('veterinario')
        .select('nombre_vet, apellidos_vet, email_vet, run_vet, celular_vet, direccion_vet, id_region')
        .eq('id_auth', user.id)
        .single();

      if (vetError) {
        console.error('Error al obtener los datos del veterinario:', vetError);
        return;
      }

      if (data) {
        this.form.setValue({
          nombre_vet: data.nombre_vet,
          apellidos_vet: data.apellidos_vet,
          email_vet: data.email_vet,
          run_vet: data.run_vet,
          celular_vet: data.celular_vet,
          direccion_vet: data.direccion_vet,
          id_region: data.id_region ?? null // Garantiza tipo correcto
        });
      }
    } catch (error) {
      console.error('Error en la consulta:', error);
    }
  }

  async actualizarDatos() {
    if (this.form.invalid) return;

    const { nombre_vet, apellidos_vet, email_vet, celular_vet, direccion_vet, id_region } = this.form.value;

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        console.error('Error al obtener el usuario:', error);
        this.mostrarToast('Error al obtener el usuario', 'danger');
        return;
      }

      if (!user) {
        console.warn('No se encontró un usuario autenticado.');
        this.mostrarToast('No se encontró un usuario autenticado', 'danger');
        return;
      }

      const { data, error: updateError } = await this.supabase
        .from('veterinario')
        .update({
          nombre_vet,
          apellidos_vet,
          email_vet,
          celular_vet,
          direccion_vet,
          id_region
        })
        .eq('id_auth', user.id);

      if (updateError) {
        console.error('Error al actualizar los datos del veterinario:', updateError);
        this.mostrarToast('Error al actualizar la información', 'danger');
        return;
      }

      this.mostrarToast('Datos actualizados correctamente', 'success');
      this.router.navigate(['/perfil']);
    } catch (error) {
      console.error('Error en la actualización:', error);
      this.mostrarToast('Error inesperado: ', 'danger');
    }
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