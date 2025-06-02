import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

// Supabase config
const supabase = createClient('https://irorlonysbmkbdthvrmt.supabase.co', 'TU_SUPABASE_KEY');

@Component({
  selector: 'app-agregar-mascota',
  templateUrl: './agregar-mascota.page.html',
  styleUrls: ['./agregar-mascota.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, RouterModule, HeaderComponent]
})
export class AgregarMascotaPage implements OnInit {
  mascotaForm!: FormGroup;
  especies: any[] = [];
  razas: any[] = [];
  gruposSanguineos: any[] = [];
  estados: any[] = [];
  runTutor!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.runTutor = this.route.snapshot.paramMap.get('runTutor') || '';
    this.mascotaForm = this.fb.group({
      masc_nom: ['', Validators.required],
      masc_edad: [''],
      masc_cumpleanos: [''],
      masc_peso: [''],
      masc_color: [''],
      masc_tamano: [''],
      masc_pelaje: [''],
      masc_esterilizado: [false],
      masc_num_chip: [''],
      id_especie: [''],
      id_raza: [''],
      id_grupo_sanguineo: [''],
      masc_observaciones: [''],
      id_estado: ['', Validators.required],
      run_tutor: [this.runTutor]
    });

    await this.cargarEspecies();
    await this.cargarEstados();
  }

  async cargarEspecies() {
    const { data, error } = await supabase.from('especie').select('*');
    if (!error) this.especies = data;
  }

  async cargarDependencias() {
    const especieId = this.mascotaForm.value.id_especie;

    const [razasRes, gruposRes] = await Promise.all([
      supabase.from('raza').select('*').eq('id_especie', especieId),
      supabase.from('grupo_sanguineo').select('*').eq('id_especie', especieId)
    ]);

    if (!razasRes.error) this.razas = razasRes.data;
    if (!gruposRes.error) this.gruposSanguineos = gruposRes.data;
  }

  async cargarEstados() {
    const { data, error } = await supabase.from('estado').select('*');
    if (!error) this.estados = data;
  }

  async guardarMascota() {
    const { error } = await supabase.from('mascota').insert(this.mascotaForm.value);

    const toast = await this.toastController.create({
      message: error ? 'Error al guardar mascota' : 'Mascota registrada con éxito',
      color: error ? 'danger' : 'success',
      duration: 2000
    });

    await toast.present();

    if (!error) this.router.navigate(['/veterinario/tutor/mascotas', this.runTutor]);
  }
}
