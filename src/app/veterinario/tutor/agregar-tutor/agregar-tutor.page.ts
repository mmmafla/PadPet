import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { createClient } from '@supabase/supabase-js';
import { ActivatedRoute, Router } from '@angular/router';

// Configuración de Supabase
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  standalone: true,
  selector: 'app-agregar-tutor',
  templateUrl: './agregar-tutor.page.html',
  styleUrls: ['./agregar-tutor.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent]
})
export class AgregarTutorPage implements OnInit {
  tutorForm!: FormGroup;
  regiones: any[] = [];
  ciudades: any[] = [];
  runVet: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.tutorForm = this.fb.group({
      run_tutor: ['', Validators.required],
      nombre_tutor: ['', Validators.required],
      apellidos_tutor: ['', Validators.required],
      direccion_tutor: ['', Validators.required],
      correo_tutor: ['', [Validators.required, Validators.email]],
      celular_tutor: ['', Validators.required],
      id_region: ['', Validators.required],
      id_ciudad: ['', Validators.required]
    });

    await this.obtenerRunVeterinario();
    await this.cargarRegiones();
  }

  async obtenerRunVeterinario() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('veterinario')
        .select('run_vet')
        .eq('id_auth', user.id)
        .single();

      if (!error && data) {
        this.runVet = data.run_vet;
      } else {
        console.error('Error al obtener run_vet:', error);
      }
    }
  }

  async cargarRegiones() {
    const { data, error } = await supabase.from('region').select('*');
    if (!error) {
      this.regiones = data;
    } else {
      console.error('Error al cargar regiones:', error);
    }
  }

  async cargarCiudades() {
    const regionId = this.tutorForm.get('id_region')?.value;
    if (regionId) {
      const { data, error } = await supabase
        .from('ciudad')
        .select('*')
        .eq('id_region', regionId);

      if (!error) {
        this.ciudades = data;
      } else {
        console.error('Error al cargar ciudades:', error);
      }
    }
  }

  async guardarTutor() {
    if (this.tutorForm.invalid || !this.runVet) return;

    const nuevoTutor = {
      ...this.tutorForm.value,
      run_vet: this.runVet
    };

    const { error } = await supabase.from('tutor').insert(nuevoTutor);
    if (error) {
      console.error('Error al guardar tutor:', error);
    } else {
      console.log('Tutor guardado con éxito');
      this.tutorForm.reset();
    }
        this.router.navigate(['/tutor']);
  }
}
