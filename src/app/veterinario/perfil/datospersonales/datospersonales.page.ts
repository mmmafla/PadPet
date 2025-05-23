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
  ciudades: any[] = [];

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
      id_region: new FormControl(null, [Validators.required]),
      id_ciudad: new FormControl(null, [Validators.required])
    });

    // Cuando cambie la región, actualizar las ciudades correspondientes
    this.form.get('id_region')?.valueChanges.subscribe(regionId => {
      this.cargarCiudadesPorRegion(regionId);
      // También resetear ciudad para que no quede una ciudad que no pertenece a la nueva región
      this.form.get('id_ciudad')?.setValue(null);
    });
  }

  async ngOnInit() {
    await this.cargarRegiones();
    await this.cargarDatosVeterinario();
  }

  // Carga todas las regiones
  async cargarRegiones() {
    try {
      const { data, error } = await this.supabase
        .from('region')
        .select('id_region, nombre_region');

      if (error) {
        console.error('Error al obtener las regiones:', error);
        return;
      }

      this.regiones = data ?? [];
    } catch (error) {
      console.error('Error en la consulta de regiones:', error);
    }
  }

  // Carga las ciudades según la región seleccionada
  async cargarCiudadesPorRegion(id_region: number | null) {
    if (!id_region) {
      this.ciudades = [];
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('ciudad')
        .select('id_ciudad, nombre_ciudad')
        .eq('id_region', id_region);

      if (error) {
        console.error('Error al obtener las ciudades:', error);
        this.ciudades = [];
        return;
      }

      this.ciudades = data ?? [];
    } catch (error) {
      console.error('Error en la consulta de ciudades:', error);
      this.ciudades = [];
    }
  }

  // Carga datos del veterinario y establece la región y ciudad seleccionadas
  async cargarDatosVeterinario() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error || !user) {
        console.error('Error al obtener el usuario:', error ?? 'Usuario no autenticado');
        return;
      }

      const { data, error: vetError } = await this.supabase
        .from('veterinario')
        .select('nombre_vet, apellidos_vet, email_vet, run_vet, celular_vet, direccion_vet, id_region, id_ciudad')
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
          id_region: data.id_region ?? null,
          id_ciudad: data.id_ciudad ?? null
        });

        // Cargar ciudades de la región actual para mostrar en el select
        if (data.id_region) {
          await this.cargarCiudadesPorRegion(data.id_region);
        }
      }
    } catch (error) {
      console.error('Error en la consulta:', error);
    }
  }

  // Actualiza los datos del veterinario
  async actualizarDatos() {
    if (this.form.invalid) return;

    const {
      nombre_vet,
      apellidos_vet,
      email_vet,
      celular_vet,
      direccion_vet,
      id_region,
      id_ciudad
    } = this.form.value;

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error || !user) {
        console.error('Error al obtener el usuario:', error ?? 'Usuario no autenticado');
        this.mostrarToast('Error al obtener el usuario', 'danger');
        return;
      }

      const { error: updateError } = await this.supabase
        .from('veterinario')
        .update({
          nombre_vet,
          apellidos_vet,
          email_vet,
          celular_vet,
          direccion_vet,
          id_region,
          id_ciudad
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
      this.mostrarToast('Error inesperado', 'danger');
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
