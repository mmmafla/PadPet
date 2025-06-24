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
import { FormsModule } from '@angular/forms';


const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-agregar-mascota',
  templateUrl: './agregar-mascota.page.html',
  styleUrls: ['./agregar-mascota.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, HeaderComponent, FormsModule],
})
export class AgregarMascotaPage implements OnInit {
  mascotaForm: FormGroup;
  especies: any[] = [];
  razas: any[] = [];
  gruposSanguineos: any[] = [];
  estados: any[] = [];
  sexo: any[] = [];
  pelaje: any[] = [];
  tamanio: any[] = [];
  esterilizado: any[] = [];

  runTutor!: string;
  id_auth!: string;

  
fechaDesconocida: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {
    this.mascotaForm = this.fb.group({
      masc_nom: ['', Validators.required],
      id_sexo: ['', Validators.required],
      masc_nacimiento: [null],
      masc_edad: [null],
      masc_peso: [null],
      id_especie: ['', Validators.required],
      id_raza: [null, Validators.required],
      id_tamanio: [null],
      id_pelaje: [null],
      masc_color: [''],
      id_esterilizado: [null],
      id_grupo_sanguineo: [null],
      masc_num_chip: [null],
      masc_observaciones: [''],
      id_estado: [''],
      run_tutor: [''],
      fecha_desconocida: [false],
      masc_edad_texto: [''],
    });
  }

  async ngOnInit() {
    this.runTutor = this.route.snapshot.paramMap.get('run_tutor') || '';
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
    await this.cargarTamanio();
    await this.cargarPelaje();
    await this.cargarEsterilizado();

    this.mascotaForm.get('id_especie')?.valueChanges.subscribe(() => {
      this.cargarDependencias();
    });

    this.mascotaForm.get('masc_nacimiento')?.valueChanges.subscribe(() => {
      this.actualizarEdad();
    });

      this.mascotaForm.get('masc_nacimiento')?.valueChanges.subscribe(() => {
    if (!this.fechaDesconocida) {
      this.actualizarEdad();
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
      return;
    }

    this.especies = data?.map((pref) => pref.id_especie) || [];
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

    this.mascotaForm.patchValue({
      id_raza: null,
      id_grupo_sanguineo: null,
    });
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


  async cargarTamanio(){
    const { data, error} = await supabase.from('tamanio_mascota').select('*');
        if (error) {
      console.error('Error cargando los tamaños de mascota', error);
    } else {
      this.tamanio = data || [];
    }

   }
  async cargarPelaje(){
        const { data, error} = await supabase.from('pelaje_mascota').select('*');
        if (error) {
      console.error('Error cargando el pelaje de mascota', error);
    } else {
      this.pelaje = data || [];
    }

  }
  async cargarEsterilizado(){
        const { data, error} = await supabase.from('esterilizado').select('*');
        if (error) {
      console.error('Error cargando esterilizado de mascota', error);
    } else {
      this.esterilizado = data || [];
    }
  }


limpiarFecha() {
  if (this.fechaDesconocida) {
    this.mascotaForm.patchValue({ masc_nacimiento: null });
  } else {
    this.mascotaForm.patchValue({ masc_edad: null });
  }
}
onFechaDesconocidaChange() {
  this.fechaDesconocida = this.mascotaForm.value.fecha_desconocida;
  this.limpiarFecha();
}


actualizarEdad() {
  const fechaNacimiento = this.mascotaForm.value.masc_nacimiento;
  if (!fechaNacimiento) {
    this.mascotaForm.patchValue({ masc_edad: null, masc_edad_texto: '' });
    return;
  }

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let years = hoy.getFullYear() - nacimiento.getFullYear();
  let months = hoy.getMonth() - nacimiento.getMonth();
  const days = hoy.getDate() - nacimiento.getDate();

  // Ajustar meses y años si no se ha cumplido el mes o día aún
  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;
  }
  if (days < 0) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  // Actualizar edad en número (solo años)
  this.mascotaForm.patchValue({ masc_edad: years });

  // Crear texto bonito para mostrar edad con años y meses
  let edadTexto = '';
  if (years > 0) {
    edadTexto += years + (years === 1 ? ' año' : ' años');
  }
  if (months > 0) {
    if (edadTexto.length > 0) edadTexto += ' y ';
    edadTexto += months + (months === 1 ? ' mes' : ' meses');
  }
  if (edadTexto === '') {
    edadTexto = 'Menos de un mes';
  }

  // Guardar el texto para mostrar en la UI
  this.mascotaForm.patchValue({ masc_edad_texto: edadTexto });
}


  async guardarMascota() {
    if (this.mascotaForm.invalid) {
      this.presentToast('Complete los campos requeridos', 'warning');
      return;
    }

    const formData = { ...this.mascotaForm.value };

  formData.id_estado = 1;
  formData.masc_num_chip = formData.masc_num_chip ? Number(formData.masc_num_chip) : null;
  formData.masc_edad = formData.masc_edad ? Number(formData.masc_edad) : null;
  formData.id_especie = Number(formData.id_especie);
  formData.id_raza = formData.id_raza ? Number(formData.id_raza) : null;
  formData.id_grupo_sanguineo = formData.id_grupo_sanguineo ? Number(formData.id_grupo_sanguineo) : null;
  formData.id_sexo = Number(formData.id_sexo);
  formData.id_pelaje = Number(formData.id_pelaje);
  formData.id_tamanio = Number(formData.id_tamanio);
  formData.id_esterilizado = Number(formData.id_esterilizado);

  delete formData.masc_edad_texto;
  delete formData.fecha_desconocida;

    const { error } = await supabase.from('mascota').insert([formData]);



    if (error) {
      this.presentToast('Error guardando mascota: ' + error.message, 'danger');
    } else {
      this.presentToast('Mascota guardada correctamente', 'success');
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