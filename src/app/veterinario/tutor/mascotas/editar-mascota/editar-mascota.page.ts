import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-editar-mascota',
  templateUrl: './editar-mascota.page.html',
  styleUrls: ['./editar-mascota.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, HeaderComponent],
})
export class EditarMascotaPage implements OnInit {
  mascotaForm!: FormGroup;
  especies: any[] = [];
  razas: any[] = [];
  gruposSanguineos: any[] = [];
  estados: any[] = [];
  runTutor!: string;
  idMasc!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.idMasc = Number(this.route.snapshot.paramMap.get('id_masc'));
    this.runTutor = this.route.snapshot.paramMap.get('run_tutor') || '';

    this.mascotaForm = this.fb.group({
      masc_nom: ['', Validators.required],
      masc_nacimiento: [null],
      masc_edad: [null],
      masc_peso: [null],
      masc_color: [''],
      masc_tamano: [''],
      masc_pelaje: [''],
      masc_esterilizado: [''],
      masc_num_chip: [null],
      id_especie: ['', Validators.required],
      id_raza: [null],
      id_grupo_sanguineo: [null],
      masc_observaciones: [''],
      id_estado: ['', Validators.required],
      run_tutor: [this.runTutor],
    });

    await this.cargarEspecies();
    await this.cargarEstados();
    await this.cargarMascota();
  }

  async cargarEspecies() {
    const { data, error } = await supabase.from('especie').select('*');
    if (!error) this.especies = data || [];
  }

  async cargarDependencias() {
    const especieId = this.mascotaForm.value.id_especie;
    if (!especieId) return;

    const [razasRes, gruposRes] = await Promise.all([
      supabase.from('raza').select('*').eq('id_especie', especieId),
      supabase.from('grupo_sanguineo').select('*').eq('id_especie', especieId),
    ]);

    if (!razasRes.error) this.razas = razasRes.data || [];
    if (!gruposRes.error) this.gruposSanguineos = gruposRes.data || [];
  }

  async cargarEstados() {
    const { data, error } = await supabase.from('estado_mascota').select('*');
    if (!error) this.estados = data || [];
  }

  async cargarMascota() {
    const { data, error } = await supabase
      .from('mascota')
      .select('*')
      .eq('id_masc', this.idMasc)
      .single();

    if (error || !data) {
      this.presentToast('Error al cargar datos de la mascota', 'danger');
      return;
    }

    this.mascotaForm.patchValue(data);
    await this.cargarDependencias();
  }

  actualizarEdad() {
    const fechaNacimiento = this.mascotaForm.value.masc_nacimiento;
    if (!fechaNacimiento) {
      this.mascotaForm.patchValue({ masc_edad: null });
      return;
    }

    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    this.mascotaForm.patchValue({ masc_edad: edad });
  }

  async actualizarMascota() {
    const formData = { ...this.mascotaForm.value };

    formData.masc_num_chip = formData.masc_num_chip ? Number(formData.masc_num_chip) : null;
    formData.masc_edad = formData.masc_edad ? Number(formData.masc_edad) : null;
    formData.id_especie = Number(formData.id_especie);
    formData.id_raza = formData.id_raza ? Number(formData.id_raza) : null;
    formData.id_grupo_sanguineo = formData.id_grupo_sanguineo ? Number(formData.id_grupo_sanguineo) : null;
    formData.id_estado = Number(formData.id_estado);

    const { error } = await supabase
      .from('mascota')
      .update(formData)
      .eq('id_masc', this.idMasc);

    if (error) {
      this.presentToast('Error actualizando mascota: ' + error.message, 'danger');
    } else {
      this.presentToast('Mascota actualizada correctamente', 'success');
      this.router.navigate(['/veterinario/tutor/mascotas', this.runTutor]);
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
