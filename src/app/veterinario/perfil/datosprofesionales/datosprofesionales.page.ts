import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJI...';
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

  estadoSolicitudId: number | null = null;
  mensajeSolicitud: string | null = null;
  solicitudYaExiste = false;

  readonly ESTADO_ACEPTADA = 1;
  readonly ESTADO_RECHAZADA = 2;
  readonly ESTADO_PENDIENTE = 3;

  supabase = inject(SupabaseService);
  toastController = inject(ToastController);
  router = inject(Router);

  currentYear = new Date().getFullYear();

  async ngOnInit() {
    this.form = new FormGroup({
      universidad: new FormControl('', Validators.required),
      pais: new FormControl('', Validators.required),
      especialidad: new FormControl('', Validators.required),
      anoTitulacion: new FormControl('', [
        Validators.required,
        Validators.min(1980),
        Validators.max(this.currentYear)
      ])
    });

    await this.cargarCatalogos(); 
    await this.obtenerRunVetYDatos();
    await this.verificarSolicitudExistente();

    this.form.get('pais')?.valueChanges.subscribe((idPaisSeleccionado) => {
      this.filtrarUniversidadesPorPais(idPaisSeleccionado);
      this.form.get('universidad')?.setValue('');
    });
  }

  async cargarCatalogos() {
    try {
      const { data: paises } = await this.supabase.from('pais').select('*');
      const { data: especialidades } = await this.supabase.from('especialidad').select('*');
      const { data: universidades } = await this.supabase.from('universidad').select('id_uni, nom_uni, id_pais');

      this.paises = paises ?? [];
      this.especialidades = especialidades ?? [];
      this.universidades = universidades ?? [];
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  }

  async obtenerRunVetYDatos() {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) return;

      const idAuth = user.id;
      const { data: veterinario } = await this.supabase.from('veterinario').select('run_vet').eq('id_auth', idAuth).single();
      if (!veterinario) return;

      this.runVet = veterinario.run_vet;

      const { data } = await this.supabase.from('dato_profesional').select('*').eq('run_vet', this.runVet).single();
      if (data) {
        this.form.patchValue({
          pais: data.id_pais ?? '',
          especialidad: data.id_especialidad ?? '',
          anoTitulacion: data.anno_titulacion ?? ''
        });

        this.filtrarUniversidadesPorPais(data.id_pais);
        this.form.patchValue({ universidad: data.id_uni ?? '' });

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

  async guardarOActualizarDatos(): Promise<boolean> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos correctamente', 'danger');
      return false;
    }

    const { universidad, pais, especialidad, anoTitulacion } = this.form.value;

    try {
      const { data: existente } = await this.supabase.from('dato_profesional').select('run_vet').eq('run_vet', this.runVet).single();

      const payload = {
        run_vet: this.runVet,
        id_uni: universidad,
        id_pais: pais,
        id_especialidad: especialidad,
        anno_titulacion: anoTitulacion,
        foto_titulo: this.fotoTituloFileName
      };

      if (existente) {
        const { error } = await this.supabase.from('dato_profesional').update(payload).eq('run_vet', this.runVet);
        if (error) throw error;
      } else {
        const { error } = await this.supabase.from('dato_profesional').insert(payload);
        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error guardando datos:', error);
      this.mostrarToast('Error al guardar los datos', 'danger');
      return false;
    }
  }

  async guardarDatos() {
    const guardado = await this.guardarOActualizarDatos();
    if (guardado) {
      this.mostrarToast('Datos guardados correctamente');
      this.router.navigate(['/perfil']);
    }
  }

  async enviarInformacion() {
    const guardado = await this.guardarOActualizarDatos();
    if (!guardado) return;

    try {
      const { data: solicitudesExistentes } = await this.supabase
        .from('solicitud')
        .select('id_solicitud, id_est_solicitud')
        .eq('run_vet', this.runVet)
        .order('fecha_envio', { ascending: false })
        .limit(1);

      if (!solicitudesExistentes || solicitudesExistentes.length === 0) {
        await this.supabase.from('solicitud').insert({
          run_vet: this.runVet,
          id_est_solicitud: this.ESTADO_PENDIENTE,
          fecha_envio: new Date().toISOString(),
        });
      } else {
        const solicitud = solicitudesExistentes[0];
        if (solicitud.id_est_solicitud === this.ESTADO_RECHAZADA) {
          await this.supabase.from('solicitud').update({
            id_est_solicitud: this.ESTADO_PENDIENTE,
            comentario: null,
            fecha_envio: new Date().toISOString()
          }).eq('id_solicitud', solicitud.id_solicitud);
        } else {
          this.estadoSolicitudId = solicitud.id_est_solicitud;
          this.mensajeSolicitud = 'Ya existe una solicitud enviada.';
          this.mostrarToast('Ya existe una solicitud enviada.', 'warning');
          return;
        }
      }

      await this.supabase.from('veterinario')
        .update({ estado_solicitud: this.ESTADO_PENDIENTE })
        .eq('run_vet', this.runVet);

      this.estadoSolicitudId = this.ESTADO_PENDIENTE;
      this.mensajeSolicitud = 'Su solicitud se encuentra pendiente de aprobación.';
      this.mostrarToast('Solicitud enviada correctamente');

    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      this.mostrarToast('Hubo un error al enviar la solicitud.', 'danger');
    }
  }

  async verificarSolicitudExistente() {
    const { data: solicitudExistente, error } = await this.supabase
      .from('solicitud')
      .select('id_est_solicitud')
      .eq('run_vet', this.runVet)
      .order('fecha_envio', { ascending: false })
      .limit(1);

    if (error) return;

    if (solicitudExistente && solicitudExistente.length > 0) {
      this.estadoSolicitudId = solicitudExistente[0].id_est_solicitud;
      this.mensajeSolicitud = 'Ya has enviado una solicitud.';
      this.solicitudYaExiste = true;
    }
  }

  puedeEnviarSolicitud(): boolean {
    return this.form.valid &&
      this.fotoTituloFileName !== null &&
      this.estadoSolicitudId !== this.ESTADO_PENDIENTE &&
      this.estadoSolicitudId !== this.ESTADO_ACEPTADA;
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

  async descargarImagenCertificado(path: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage.from('image-certificate').download(path);
      if (error) return null;
      return URL.createObjectURL(data);
    } catch {
      return null;
    }
  }

  async subirImagenCertificado(event: Event) {
    const element = event.target as HTMLInputElement;
    if (!element.files || element.files.length === 0) return;
    const file = element.files[0];
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

      await supabase.from('dato_profesional').upsert({
        run_vet: this.runVet,
        foto_titulo: filePath
      }, { onConflict: 'run_vet' });

      this.mostrarToast('Certificado subido correctamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      this.mostrarToast('Error al subir certificado', 'danger');
    }
  }

  async eliminarImagenCertificado() {
    if (!this.fotoTituloFileName) {
      this.mostrarToast('No hay imagen para eliminar', 'warning');
      return;
    }

    try {
      await supabase.storage.from('image-certificate').remove([this.fotoTituloFileName]);
      await supabase.from('dato_profesional').update({ foto_titulo: null }).eq('run_vet', this.runVet);

      this.fotoTituloFileName = null;
      this.fotoTituloUrl = null;
      this.mostrarToast('Certificado eliminado');
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      this.mostrarToast('Error al eliminar certificado', 'danger');
    }
  }

  async confirmarEliminacionImagen() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Eliminar imagen';
    alert.message = '¿Estás segura de que deseas eliminar esta imagen?';
    alert.buttons = [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: () => this.eliminarImagenCertificado()
      }
    ];
    document.body.appendChild(alert);
    await alert.present();
  }

}
