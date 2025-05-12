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


  // Injecting SupabaseService and ToastController for toast notifications
  supabase = inject(SupabaseService);
  toastController = inject(ToastController);
  router = inject(Router);

  constructor() {
    // Initialize the form with empty values and validation rules
    this.form = new FormGroup({
      nombre_vet: new FormControl('', [Validators.required]),
      apellidos_vet: new FormControl('', [Validators.required]),
      email_vet: new FormControl('', [Validators.required, Validators.email]),
      run_vet: new FormControl({ value: '', disabled: true }), // Solo leer
      celular_vet: new FormControl('', [Validators.required]),
      direccion_vet: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    
    // Cargar los datos actuales del veterinario desde la base de datos
    this.cargarDatosVeterinario();
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

      // Obtener los datos del veterinario desde la base de datos
      const { data, error: vetError } = await this.supabase
        .from('veterinario')
        .select('nombre_vet, apellidos_vet, email_vet, run_vet, celular_vet, direccion_vet')
        .eq('id_auth', user.id)
        .single();

      if (vetError) {
        console.error('Error al obtener los datos del veterinario:', vetError);
        return;
      }

      if (data) {
        // Asignar los datos al formulario
        this.form.setValue({
          nombre_vet: data.nombre_vet,
          apellidos_vet: data.apellidos_vet,
          email_vet: data.email_vet,
          run_vet: data.run_vet,
          celular_vet: data.celular_vet,
          direccion_vet: data.direccion_vet,
        });
      }
    } catch (error) {
      console.error('Error en la consulta:', error);
    }
  }

  async actualizarDatos() {
    if (this.form.invalid) return;

    const { nombre_vet, apellidos_vet, email_vet, celular_vet ,direccion_vet} = this.form.value;

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

      // Actualizar los datos del veterinario en la base de datos
      const { data, error: updateError } = await this.supabase
        .from('veterinario')
        .update({
          nombre_vet,
          apellidos_vet,
          email_vet,
          celular_vet,
          direccion_vet
        })
        .eq('id_auth', user.id);

      if (updateError) {
        console.error('Error al actualizar los datos del veterinario:', updateError);
        this.mostrarToast('Error al actualizar la información', 'danger');
        return;
      }

      this.mostrarToast('Datos actualizados correctamente', 'success');
      this.router.navigate(['/perfil']); // O la ruta que corresponda
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
