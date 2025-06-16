import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, RefresherCustomEvent, AlertController, ToastController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { createClient } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';

// Configuración Supabase
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-mascotas',
  templateUrl: './mascotas.page.html',
  styleUrls: ['./mascotas.page.scss'],
  standalone: true,
  imports: [IonicModule, HeaderComponent, CommonModule]
})
export class MascotasPage implements OnInit {
  mascotas: any[] = [];
  runTutor!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.runTutor = this.route.snapshot.paramMap.get('run_tutor') || '';
    await this.cargarMascotas();
  }

  async ionViewWillEnter() {
    await this.cargarMascotas();
  }

  async cargarMascotas() {
    // 1. Mascotas básicas
    const { data: mascotasData, error: err1 } = await supabase
      .from('mascota')
      .select('id_masc, masc_nom, id_raza, id_estado, run_tutor')
      .eq('run_tutor', this.runTutor);

    if (err1) {
      console.error('Error cargar mascotas', err1);
      return;
    }

    // 2. Razas
    const { data: razasData, error: err2 } = await supabase
      .from('raza')
      .select('id_raza, id_especie');

    if (err2) {
      console.error('Error cargar razas', err2);
      return;
    }

    // 3. Especies
    const { data: especiesData, error: err3 } = await supabase
      .from('especie')
      .select('id_especie, nom_especie');

    if (err3) {
      console.error('Error cargar especies', err3);
      return;
    }

    // 4. Estados
    const { data: estadosData, error: err4 } = await supabase
      .from('estado_mascota')
      .select('id_estado, estado');

    if (err4) {
      console.error('Error cargar estados', err4);
      return;
    }

    // 5. Combinar datos
    this.mascotas = mascotasData.map(mascota => {
      const raza = razasData.find(r => r.id_raza === mascota.id_raza);
      const especie = raza ? especiesData.find(e => e.id_especie === raza.id_especie) : null;
      const estado = estadosData.find(s => s.id_estado === mascota.id_estado);

      return {
        id_masc: mascota.id_masc,
        masc_nom: mascota.masc_nom,
        nom_especie: especie ? especie.nom_especie : 'N/D',
        estado: estado ? estado.estado : 'N/D'
      };
    });
  }

  irAgregarMascota() {
    this.router.navigate([`/veterinario/tutor/mascotas/${this.runTutor}/agregar`]);
  }

  irEditarMascota(idMasc: number) {
    this.router.navigate(['/veterinario/tutor/mascotas/editar-mascota', this.runTutor, idMasc]);
  }

  async confirmarEliminarMascota(mascota: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Seguro que quieres eliminar a ${mascota.masc_nom}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => this.eliminarMascota(mascota.id_masc) }
      ]
    });
    await alert.present();
  }

  async eliminarMascota(idMasc: number) {
    const { error } = await supabase
      .from('mascota')
      .delete()
      .eq('id_masc', idMasc);

    if (error) {
      console.error('Error al eliminar mascota:', error);
      return;
    }

    const toast = await this.toastController.create({
      message: 'Mascota eliminada correctamente',
      duration: 2000,
      color: 'success'
    });

    await toast.present();
    await this.cargarMascotas();
  }

  async handleRefresh(event: RefresherCustomEvent) {
    await this.cargarMascotas();
    event.detail.complete();
  }
  // -------- Navegar a historial clínico ----------
  verHistorialClinico(idMasc: number) {
    this.router.navigate([`/veterinario/tutor/mascotas/${this.runTutor}/${idMasc}/historial-clinico`]);
  }
}
