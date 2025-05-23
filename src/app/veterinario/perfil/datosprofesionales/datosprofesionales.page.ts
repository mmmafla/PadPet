import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-datosprofesionales',
  templateUrl: './datosprofesionales.page.html',
  styleUrls: ['./datosprofesionales.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, HeaderComponent]
})
export class DatosprofesionalesPage implements OnInit {
  form!: FormGroup;
  paises: any[] = [];
  especialidades: any[] = [];
  runVet: string = '';

  supabase = inject(SupabaseService);
  toastController = inject(ToastController);
  router = inject(Router);

  ngOnInit() {
    this.form = new FormGroup({
      universidad: new FormControl('', Validators.required),
      pais: new FormControl('', Validators.required),
      especialidad: new FormControl('', Validators.required),
      anoTitulacion: new FormControl('', [
        Validators.required,
        Validators.min(1900),
        Validators.max(new Date().getFullYear())
      ])
    });

    this.cargarCatalogos();
    this.obtenerRunVetYDatos();
  }

  async cargarCatalogos() {
    try {
      const { data: paises } = await this.supabase.from('pais').select('*');
      const { data: especialidades } = await this.supabase.from('especialidad').select('*');
      this.paises = paises ?? [];
      this.especialidades = especialidades ?? [];
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  }

  async obtenerRunVetYDatos() {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error al obtener usuario:', userError);
        return;
      }

      const idAuth = user.id;
      const { data: veterinario, error: vetError } = await this.supabase
        .from('veterinario')
        .select('run_vet')
        .eq('id_auth', idAuth)
        .single();

      if (vetError || !veterinario) {
        console.error('No se encontró veterinario para este usuario:', vetError);
        return;
      }

      this.runVet = veterinario.run_vet;

      const { data, error } = await this.supabase
        .from('dato_profesional')
        .select('*')
        .eq('run_vet', this.runVet)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al obtener dato_profesional:', error);
        return;
      }

      if (data) {
        this.form.patchValue({
          universidad: data.uni_egreso ?? '',
          pais: data.id_pais ?? '',
          especialidad: data.id_especialidad ?? '',
          anoTitulacion: data.anno_titulacion ?? ''
        });
      }
    } catch (error) {
      console.error('Error al cargar datos del veterinario:', error);
    }
  }

  async guardarDatos() {
    if (this.form.invalid) {
      this.mostrarToast('Por favor completa todos los campos correctamente', 'danger');
      return;
    }

    const { universidad, pais, especialidad, anoTitulacion } = this.form.value;

    try {
      const { data: existente } = await this.supabase
        .from('dato_profesional')
        .select('run_vet')
        .eq('run_vet', this.runVet)
        .single();

      if (existente) {
        const { error } = await this.supabase
          .from('dato_profesional')
          .update({
            uni_egreso: universidad,
            id_pais: pais,
            id_especialidad: especialidad,
            anno_titulacion: anoTitulacion
          })
          .eq('run_vet', this.runVet);

        if (error) throw error;
        this.mostrarToast('Datos actualizados correctamente');
      } else {
        const { error } = await this.supabase
          .from('dato_profesional')
          .insert({
            run_vet: this.runVet,
            uni_egreso: universidad,
            id_pais: pais,
            id_especialidad: especialidad,
            anno_titulacion: anoTitulacion
          });

        if (error) throw error;
        this.mostrarToast('Datos guardados correctamente');
      }

      this.router.navigate(['/perfil']);
    } catch (error) {
      console.error('Error guardando datos:', error);
      this.mostrarToast('Error al guardar los datos', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'middle',
    });
    toast.present();
  }
}
