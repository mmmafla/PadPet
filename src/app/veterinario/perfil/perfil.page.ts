import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { createClient } from '@supabase/supabase-js';
import { CommonModule, NgIf  } from '@angular/common';

// Configuraci[on de Supabase
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, HeaderComponent, NgIf]
})
export class PerfilPage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  fotoPerfilUrl: string | null = null;
  nombreArchivoAnterior: string | null = null;

  constructor() {}

  async ngOnInit() {
    await this.obtenerFotoPerfil();
  }

  selectImage() {
    this.fileInput.nativeElement.click();
  }

  private extraerNombreDesdeUrl(url: string): string {
    const partes = url.split('/');
    return partes[partes.length - 1];
  }

  async obtenerRunVet(): Promise<number | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return null;

    const { data, error } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', userId)
      .single();

    if (error || !data) {
      console.error('No se pudo obtener run_vet:', error?.message);
      return null;
    }

    return data.run_vet;
  }

  async eliminarFotoPerfil() {
    const user = await supabase.auth.getUser();
    const userId = user.data?.user?.id || null;
    if (!userId) {
      console.error('No hay usuario autenticado');
      return;
    }

    // Obtener run_vet
    const { data: vetData, error: vetError } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', userId)
      .single();

    if (vetError || !vetData?.run_vet) {
      console.error('No se pudo obtener run_vet:', vetError?.message || 'run_vet no disponible');
      return;
    }

    const runVet = vetData.run_vet;

    // Obtener la URL actual desde dato_profesional
    const { data: dpData, error: dpError } = await supabase
      .from('dato_profesional')
      .select('foto_perfil')
      .eq('run_vet', runVet)
      .single();

    if (dpError || !dpData?.foto_perfil) {
      console.error('No se encontró foto de perfil para eliminar');
      return;
    }

    const url = dpData.foto_perfil;
    const nombreArchivo = this.extraerNombreDesdeUrl(url);

    // Eliminar del storage
    const { error: deleteError } = await supabase.storage
      .from('image-profile')
      .remove([nombreArchivo]);

    if (deleteError) {
      console.error('Error al eliminar la imagen del storage:', deleteError.message);
      return;
    }

    // Borrar URL del campo foto_perfil
    const { error: updateError } = await supabase
      .from('dato_profesional')
      .update({ foto_perfil: null })
      .eq('run_vet', runVet);

    if (updateError) {
      console.error('Error al limpiar el campo foto_perfil:', updateError.message);
      return;
    }

    this.fotoPerfilUrl = null;
    this.nombreArchivoAnterior = null;
    console.log('Foto de perfil eliminada correctamente');
  }


  async uploadImage(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const user = await supabase.auth.getUser();
    const userId = user.data?.user?.id || null;
    if (!userId) {
      console.error('No hay usuario autenticado');
      return;
    }

    // Obtener run_vet desde la tabla veterinario
    const { data: vetData, error: vetError } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', userId)
      .single();

    if (vetError || !vetData?.run_vet) {
      console.error('No se pudo obtener run_vet:', vetError?.message || 'run_vet no disponible');
      return;
    }

    const runVet = vetData.run_vet;
    const extension = file.name.split('.').pop();
    const fileName = `profile-${userId}-${Date.now()}.${extension}`;

    // 1. Eliminar imagen anterior si existe
    if (this.nombreArchivoAnterior) {
      const { error: deleteError } = await supabase.storage
        .from('image-profile')
        .remove([this.nombreArchivoAnterior]);

      if (deleteError) {
        console.error('Error al eliminar imagen anterior:', deleteError.message);
      } else {
        console.log('Imagen anterior eliminada');
      }
    }

    // 2. Subir nueva imagen
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('image-profile')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir la imagen:', uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('image-profile')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Actualizar campo foto_perfil en tabla dato_profesional
    const { error: updateError } = await supabase
      .from('dato_profesional')
      .update({ foto_perfil: publicUrl })
      .eq('run_vet', runVet);

    if (updateError) {
      console.error('Error al guardar la URL en la base de datos:', updateError.message);
      return;
    }

    // 4. Actualizar la vista y guardar nuevo nombre
    this.fotoPerfilUrl = publicUrl;
    this.nombreArchivoAnterior = fileName;

    console.log('Imagen subida y guardada exitosamente');
  }


  async obtenerFotoPerfil() {
    const runVet = await this.obtenerRunVet();
    if (!runVet) return;

    const { data, error } = await supabase
      .from('dato_profesional')
      .select('foto_perfil')
      .eq('run_vet', runVet)
      .single();

    if (error || !data?.foto_perfil) {
      console.warn('No se encontró imagen de perfil');
      return;
    }

    this.fotoPerfilUrl = data.foto_perfil;
    this.nombreArchivoAnterior = this.extraerNombreDesdeUrl(data.foto_perfil); // Aquí está el cambio
  }

}