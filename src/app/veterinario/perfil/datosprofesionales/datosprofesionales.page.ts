import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  universidades: any[] = [];
  universidadesFiltradas: any[] = [];
  runVet: string = '';

  fotoTituloUrl: string | null = null;
  fotoTituloFileName: string | null = null;

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
        Validators.min(1980),
        Validators.max(new Date().getFullYear())
      ])
    });

    // Cargar primero universidades
    this.cargarUniversidades().then(() => {
      this.cargarCatalogos();
      this.obtenerRunVetYDatos();
    });

    this.form.get('pais')?.valueChanges.subscribe((idPaisSeleccionado) => {
      this.filtrarUniversidadesPorPais(idPaisSeleccionado);
      this.form.get('universidad')?.setValue('');
    });
  }

  async cargarUniversidades() {
    try {
      const { data: universidades } = await this.supabase
        .from('universidad')
        .select('id_uni, nom_uni, id_pais');
      this.universidades = universidades ?? [];
    } catch (error) {
      console.error('Error cargando universidades:', error);
    }
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
          pais: data.id_pais ?? '',
          especialidad: data.id_especialidad ?? '',
          anoTitulacion: data.anno_titulacion ?? ''
        });

        this.filtrarUniversidadesPorPais(data.id_pais);
        this.form.patchValue({
          universidad: data.id_uni ?? ''
        });

        if (data.foto_titulo) {
          this.fotoTituloFileName = data.foto_titulo;
          this.fotoTituloUrl = await this.descargarImagenCertificado(data.foto_titulo);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del veterinario:', error);
    }
  }

  filtrarUniversidadesPorPais(idPais: number) {
    this.universidadesFiltradas = this.universidades.filter(u => u.id_pais === idPais);
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
            id_uni: universidad,
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
            id_uni: universidad,
            id_pais: pais,
            id_especialidad: especialidad,
            anno_titulacion: anoTitulacion,
            foto_titulo: this.fotoTituloFileName
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

  async descargarImagenCertificado(path: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('image-certificate')
        .download(path);
      if (error) {
        console.error('Error descargando imagen certificado:', error);
        return null;
      }
      return URL.createObjectURL(data);
    } catch (error) {
      console.error('Error al descargar imagen certificado:', error);
      return null;
    }
  }

  async subirImagenCertificado(event: Event) {
    const element = event.target as HTMLInputElement;
    if (!element.files || element.files.length === 0) {
      return;
    }
    const file = element.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${this.runVet}_certificado.${fileExt}`;
    const filePath = fileName;

    try {
      if (this.fotoTituloFileName) {
        await supabase.storage.from('image-certificate').remove([this.fotoTituloFileName]);
      }

      const { error: uploadError } = await supabase.storage
        .from('image-certificate')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      this.fotoTituloFileName = filePath;
      this.fotoTituloUrl = await this.descargarImagenCertificado(filePath);

      const { error: updateError } = await supabase
        .from('dato_profesional')
        .upsert({
          run_vet: this.runVet,
          foto_titulo: filePath,
        }, { onConflict: 'run_vet' });

      if (updateError) throw updateError;

      this.mostrarToast('Certificado subido correctamente');
    } catch (error) {
      console.error('Error al subir imagen certificado:', error);
      this.mostrarToast('Error al subir certificado', 'danger');
    }
  }

  async eliminarImagenCertificado() {
    if (!this.fotoTituloFileName) {
      this.mostrarToast('No hay imagen para eliminar', 'warning');
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('image-certificate')
        .remove([this.fotoTituloFileName]);

      if (error) throw error;

      const { error: updateError } = await this.supabase
        .from('dato_profesional')
        .update({ foto_titulo: null })
        .eq('run_vet', this.runVet);

      if (updateError) throw updateError;

      this.fotoTituloFileName = null;
      this.fotoTituloUrl = null;
      this.mostrarToast('Certificado eliminado');
    } catch (error) {
      console.error('Error eliminando certificado:', error);
      this.mostrarToast('Error al eliminar certificado', 'danger');
    }
  }
}
