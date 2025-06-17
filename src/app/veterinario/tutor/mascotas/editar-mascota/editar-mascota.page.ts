import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-editar-mascota',
  templateUrl: './editar-mascota.page.html',
  styleUrls: ['./editar-mascota.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, HeaderComponent],
})
export class EditarMascotaPage implements OnInit {
  mascotaForm: FormGroup;
  especies: any[] = [];
  razas: any[] = [];
  gruposSanguineos: any[] = [];
  estados: any[] = [];
  sexo: any[] = [];
  runTutor!: string;
  id_auth!: string;
  id_masc!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {
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
      id_raza: [null, Validators.required],
      id_grupo_sanguineo: [null],
      id_sexo: ['', Validators.required],
      masc_observaciones: [''],
      id_estado: ['', Validators.required],
      run_tutor: [''],
    });
  }

  async ngOnInit() {
    this.runTutor = this.route.snapshot.paramMap.get('run_tutor') || '';
    this.id_masc = this.route.snapshot.paramMap.get('id_masc') || '';
    this.mascotaForm.patchValue({ run_tutor: this.runTutor });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      this.presentToast('No se encontró usuario autenticado', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    this.id_auth = user.id;

    await this.cargarEspeciesFiltradas();
    await this.cargarEstados();
    await this.cargarSexos();

    this.mascotaForm.get('id_especie')?.valueChanges.subscribe(() => {
      this.cargarDependencias(); // En este caso, limpia
    });

    this.mascotaForm.get('masc_nacimiento')?.valueChanges.subscribe(() => {
      this.actualizarEdad();
    });

    if (this.id_masc) {
      await this.cargarDatosMascota(); // Aquí NO se limpia
    }
  }

  async cargarDatosMascota() {
    const { data, error } = await supabase
      .from('mascota')
      .select('*')
      .eq('id_masc', this.id_masc)
      .single();

    if (error) {
      console.error('Error cargando datos mascota:', error);
      this.presentToast('Error cargando datos de la mascota', 'danger');
      return;
    }

    // Cargar razas y grupos según la especie antes de aplicar valores
    await this.cargarDependencias(data.id_especie, false); // NO limpiar

    this.mascotaForm.patchValue({
      masc_nom: data.masc_nom,
      masc_nacimiento: data.masc_nacimiento,
      masc_edad: data.masc_edad,
      masc_peso: data.masc_peso,
      masc_color: data.masc_color,
      masc_tamano: data.masc_tamano,
      masc_pelaje: data.masc_pelaje,
      masc_esterilizado: data.masc_esterilizado,
      masc_num_chip: data.masc_num_chip,
      id_especie: data.id_especie,
      id_raza: data.id_raza,
      id_grupo_sanguineo: data.id_grupo_sanguineo,
      id_sexo: data.id_sexo,
      masc_observaciones: data.masc_observaciones,
      id_estado: data.id_estado,
      run_tutor: data.run_tutor,
    });
  }

  async cargarEspeciesFiltradas() {
    const { data, error } = await supabase
      .from('preferencia_especie')
      .select('id_especie(id_especie, nom_especie)')
      .eq('id_auth', this.id_auth);

    if (error) {
      console.error('Error cargando especies preferidas:', error);
      this.presentToast('Error cargando especies', 'danger');
      return;
    }

    this.especies = data?.map((pref) => pref.id_especie) || [];
  }

  // ✅ Modificada para permitir evitar limpieza en modo edición
  async cargarDependencias(especieIdParam?: number, limpiar = true) {
    const especieId =
      especieIdParam ?? this.mascotaForm.value.id_especie;
    if (!especieId) return;

    const [razasRes, gruposRes] = await Promise.all([
      supabase.from('raza').select('*').eq('id_especie', especieId),
      supabase.from('grupo_sanguineo').select('*').eq('id_especie', especieId),
    ]);

    if (!razasRes.error) this.razas = razasRes.data || [];
    if (!gruposRes.error) this.gruposSanguineos = gruposRes.data || [];

    if (limpiar) {
      this.mascotaForm.patchValue({
        id_raza: null,
        id_grupo_sanguineo: null,
      });
    }
  }

  async cargarEstados() {
    const { data, error } = await supabase.from('estado_mascota').select('*');
    if (error) {
      console.error('Error cargando estados:', error);
    } else {
      this.estados = data || [];
    }
  }

  async cargarSexos() {
    const { data, error } = await supabase.from('sexo_mascota').select('*');
    if (error) {
      console.error('Error cargando sexos de mascota', error);
    } else {
      this.sexo = data || [];
    }
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

  async guardarMascota() {
    if (this.mascotaForm.invalid) {
      this.presentToast('Complete los campos requeridos', 'warning');
      return;
    }

    const formData = { ...this.mascotaForm.value };

    formData.masc_num_chip = formData.masc_num_chip
      ? Number(formData.masc_num_chip)
      : null;
    formData.masc_edad = formData.masc_edad ? Number(formData.masc_edad) : null;
    formData.id_especie = Number(formData.id_especie);
    formData.id_raza = formData.id_raza ? Number(formData.id_raza) : null;
    formData.id_grupo_sanguineo = formData.id_grupo_sanguineo
      ? Number(formData.id_grupo_sanguineo)
      : null;
    formData.id_estado = Number(formData.id_estado);
    formData.id_sexo = Number(formData.id_sexo);

    const { error } = await supabase
      .from('mascota')
      .update(formData)
      .eq('id_masc', this.id_masc);

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