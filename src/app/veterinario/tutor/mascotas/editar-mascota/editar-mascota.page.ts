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
      id_raza: [null],
      id_grupo_sanguineo: [null],
      masc_observaciones: [''],
      id_estado: ['', Validators.required],
      run_tutor: [''],
    });
  }

  async ngOnInit() {
    // Obtener parámetros id_masc y run_tutor de la ruta
    this.id_masc = this.route.snapshot.paramMap.get('id_masc') || '';
    this.runTutor = this.route.snapshot.paramMap.get('run_tutor') || '';
    this.mascotaForm.patchValue({ run_tutor: this.runTutor });

    // Obtener usuario logueado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      this.presentToast('No se encontró usuario autenticado', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    this.id_auth = user.id;

    // Cargar especies filtradas por preferencias
    await this.cargarEspeciesFiltradas();

    // Cargar estados (general, sin filtro)
    await this.cargarEstados();

    // Cargar datos actuales de la mascota a editar
    await this.cargarDatosMascota();

    // Suscribirse a cambios en especie para recargar dependencias
    this.mascotaForm.get('id_especie')?.valueChanges.subscribe(async (idEspecie) => {
      if (idEspecie) {
        await this.cargarDependencias(idEspecie);
        // Resetear id_raza y id_grupo_sanguineo al cambiar especie para evitar inconsistencias
        this.mascotaForm.patchValue({ id_raza: null, id_grupo_sanguineo: null });
      } else {
        this.razas = [];
        this.gruposSanguineos = [];
      }
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
      this.especies = [];
      return;
    }

    this.especies = data?.map((pref) => pref.id_especie) || [];

    // Si no hay especies preferidas, mostrar mensaje
    if (this.especies.length === 0) {
      this.presentToast('No tiene especies preferidas asignadas', 'warning');
    }
  }

  async cargarDependencias(idEspecie: number) {
    if (!idEspecie) return;

    const [razasRes, gruposRes] = await Promise.all([
      supabase.from('raza').select('*').eq('id_especie', idEspecie),
      supabase.from('grupo_sanguineo').select('*').eq('id_especie', idEspecie),
    ]);

    if (!razasRes.error) this.razas = razasRes.data || [];
    else this.razas = [];

    if (!gruposRes.error) this.gruposSanguineos = gruposRes.data || [];
    else this.gruposSanguineos = [];
  }

  async cargarEstados() {
    const { data, error } = await supabase.from('estado_mascota').select('*');
    if (error) {
      console.error('Error cargando estados:', error);
      this.estados = [];
    } else {
      this.estados = data || [];
    }
  }

  async cargarDatosMascota() {
    if (!this.id_masc) {
      this.presentToast('ID de mascota no proporcionado', 'danger');
      this.router.navigate(['/veterinario/tutor/mascotas', this.runTutor]);
      return;
    }

    const { data, error } = await supabase
      .from('mascota')
      .select('*')
      .eq('id_masc', this.id_masc)
      .single();

    if (error || !data) {
      this.presentToast('Error cargando datos de la mascota', 'danger');
      this.router.navigate(['/veterinario/tutor/mascotas', this.runTutor]);
      return;
    }

    // Verificar que la especie esté en las especies preferidas del veterinario
    const especieId = data.id_especie;
    if (!this.especies.find((e) => e.id_especie === especieId)) {
      this.presentToast(
        'La especie de esta mascota no está en sus preferencias. Por favor actualice sus preferencias.',
        'warning'
      );
    }

    // Cargar dependencias para la especie actual (razas, grupos sanguíneos)
    await this.cargarDependencias(especieId);

    // Patch form con datos de la mascota (ajustar si es necesario la estructura)
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
      masc_observaciones: data.masc_observaciones,
      id_estado: data.id_estado,
      run_tutor: data.run_tutor,
    });
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

    // Actualizar mascota (update)
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
