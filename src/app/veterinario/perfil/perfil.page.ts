import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { createClient } from '@supabase/supabase-js';
import { CommonModule, NgIf  } from '@angular/common';

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
  @ViewChild('fileFirmaInput') fileFirmaInput!: ElementRef;
  @ViewChild('fileInputFirma') fileInputFirma!: ElementRef;


  fotoPerfilUrl: string | null = null;
  nombreArchivoAnterior: string | null = null;

  firmaUrl: string | null = null;
  nombreFirmaAnterior: string | null = null;

  constructor() {}

  async ngOnInit() {
    await this.obtenerFotoPerfil();
    await this.obtenerFirma();
  }

  selectImage() {
    this.fileInput.nativeElement.click();
  }

  selectFirma() {
    this.fileInputFirma.nativeElement.click();
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
    const runVet = await this.obtenerRunVet();
    if (!runVet) return;

    const { data, error } = await supabase
      .from('dato_profesional')
      .select('foto_perfil')
      .eq('run_vet', runVet)
      .single();

    if (error || !data?.foto_perfil) return;

    const nombreArchivo = this.extraerNombreDesdeUrl(data.foto_perfil);

    await supabase.storage.from('image-profile').remove([nombreArchivo]);

    await supabase
      .from('dato_profesional')
      .update({ foto_perfil: null })
      .eq('run_vet', runVet);

    this.fotoPerfilUrl = null;
    this.nombreArchivoAnterior = null;
  }

  async uploadImage(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const runVet = await this.obtenerRunVet();
    if (!runVet) return;

    const extension = file.name.split('.').pop();
    const fileName = `profile-${runVet}-${Date.now()}.${extension}`;

    if (this.nombreArchivoAnterior) {
      await supabase.storage.from('image-profile').remove([this.nombreArchivoAnterior]);
    }

    await supabase.storage.from('image-profile').upload(fileName, file);

    const { data } = supabase.storage.from('image-profile').getPublicUrl(fileName);

    await supabase
      .from('dato_profesional')
      .update({ foto_perfil: data.publicUrl })
      .eq('run_vet', runVet);

    this.fotoPerfilUrl = data.publicUrl;
    this.nombreArchivoAnterior = fileName;
  }

  async obtenerFotoPerfil() {
    const runVet = await this.obtenerRunVet();
    if (!runVet) return;

    const { data } = await supabase
      .from('dato_profesional')
      .select('foto_perfil')
      .eq('run_vet', runVet)
      .single();

    if (!data?.foto_perfil) return;

    this.fotoPerfilUrl = data.foto_perfil;
    this.nombreArchivoAnterior = this.extraerNombreDesdeUrl(data.foto_perfil);
  }

  async obtenerFirma() {
    const runVet = await this.obtenerRunVet();
    if (!runVet) return;

    const { data } = await supabase
      .from('dato_profesional')
      .select('firma_png')
      .eq('run_vet', runVet)
      .single();

    if (!data?.firma_png) return;

    this.firmaUrl = data.firma_png;
    this.nombreFirmaAnterior = this.extraerNombreDesdeUrl(data.firma_png);
  }

  async uploadFirma(event: any) {
    const file: File = event.target.files?.[0];
    if (!file) {
      console.error('No se seleccionó archivo');
      return;
    }

    const user = await supabase.auth.getUser();
    const userId = user.data?.user?.id;
    if (!userId) {
      console.error('Usuario no autenticado');
      return;
    }

    const { data: vetData, error: vetError } = await supabase
      .from('veterinario')
      .select('run_vet')
      .eq('id_auth', userId)
      .single();

    if (vetError || !vetData?.run_vet) {
      console.error('Error obteniendo run_vet', vetError?.message);
      return;
    }

    const runVet = vetData.run_vet;

    // Obtener firma actual desde la BD para eliminarla
    const { data: dpData, error: dpError } = await supabase
      .from('dato_profesional')
      .select('firma_png')
      .eq('run_vet', runVet)
      .single();

    if (dpError) {
      console.warn('No se pudo verificar firma anterior:', dpError.message);
    } else if (dpData?.firma_png) {
      const nombreFirmaAnterior = this.extraerNombreDesdeUrl(dpData.firma_png);
      const { error: deleteError } = await supabase.storage
        .from('image-signature')
        .remove([nombreFirmaAnterior]);

      if (deleteError) {
        console.error('Error al eliminar firma anterior del storage:', deleteError.message);
      } else {
        console.log('Firma anterior eliminada');
      }
    }

    // Subir nueva firma
    const extension = file.name.split('.').pop();
    const fileName = `firma-${runVet}-${Date.now()}.${extension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('image-signature')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir la nueva firma:', uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('image-signature')
      .getPublicUrl(fileName);

    const firmaUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('dato_profesional')
      .update({ firma_png: firmaUrl })
      .eq('run_vet', runVet);

    if (updateError) {
      console.error('Error actualizando firma_png:', updateError.message);
      return;
    }

    this.firmaUrl = firmaUrl;
    this.nombreFirmaAnterior = fileName;
    console.log('Firma nueva subida y registrada correctamente');
  }


  async eliminarFirma() {
    const runVet = await this.obtenerRunVet();
    if (!runVet) return;

    const { data } = await supabase
      .from('dato_profesional')
      .select('firma_png')
      .eq('run_vet', runVet)
      .single();

    if (!data?.firma_png) return;

    const nombreArchivo = this.extraerNombreDesdeUrl(data.firma_png);

    await supabase.storage.from('image-signature').remove([nombreArchivo]);

    await supabase
      .from('dato_profesional')
      .update({ firma_png: null })
      .eq('run_vet', runVet);

    this.firmaUrl = null;
    this.nombreFirmaAnterior = null;
  }
}
