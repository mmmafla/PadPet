import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { createClient } from '@supabase/supabase-js';
import { Router, ActivatedRoute } from '@angular/router';

// Configuración de Supabase
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  standalone: true,
  selector: 'app-editar-tutor',
  templateUrl: './editar-tutor.page.html',
  styleUrls: ['./editar-tutor.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent]
})
export class EditarTutorPage implements OnInit {
  tutorForm!: FormGroup;
  regiones: any[] = [];
  ciudades: any[] = [];
  runTutorParam: string = '';

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.tutorForm = this.fb.group({
      run_tutor: [{value: '', disabled: true}, Validators.required], // disabled para que no sea editable
      nombre_tutor: ['', Validators.required],
      apellidos_tutor: ['', Validators.required],
      direccion_tutor: ['', Validators.required],
      correo_tutor: ['', [Validators.required, Validators.email]],
      celular_tutor: ['', Validators.required],
      id_region: ['', Validators.required],
      id_ciudad: ['', Validators.required]
    });

    // Obtener parámetro runTutor para cargar datos
    this.runTutorParam = this.route.snapshot.paramMap.get('runTutor') || '';
    if (this.runTutorParam) {
      await this.cargarTutor(this.runTutorParam);
    }

    await this.cargarRegiones();
  }

  // Carga datos del tutor a editar
  async cargarTutor(runTutor: string) {
    const { data, error } = await supabase
      .from('tutor')
      .select('*')
      .eq('run_tutor', runTutor)
      .single();

    if (error) {
      console.error('Error al cargar tutor:', error);
      this.mostrarToast('Error al cargar tutor', 'danger');
      return;
    }

    // Setear valores en el formulario, id_region primero para luego cargar ciudades
    this.tutorForm.patchValue({
      run_tutor: data.run_tutor,
      nombre_tutor: data.nombre_tutor,
      apellidos_tutor: data.apellidos_tutor,
      direccion_tutor: data.direccion_tutor,
      correo_tutor: data.correo_tutor,
      celular_tutor: data.celular_tutor,
      id_region: data.id_region
    });

    await this.cargarCiudades();

    this.tutorForm.patchValue({
      id_ciudad: data.id_ciudad
    });
  }

  // Carga regiones
  async cargarRegiones() {
    const { data, error } = await supabase.from('region').select('*');
    if (!error) {
      this.regiones = data;
    } else {
      console.error('Error al cargar regiones:', error);
    }
  }

  // Carga ciudades según región seleccionada
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
    } else {
      this.ciudades = [];
    }
  }

  // Guardar cambios
  async guardarCambios() {
    if (this.tutorForm.invalid) {
      return;
    }

    // Obtener valores incluyendo los campos deshabilitados
    const tutorActualizado = this.tutorForm.getRawValue();

    const { error } = await supabase
      .from('tutor')
      .update(tutorActualizado)
      .eq('run_tutor', this.runTutorParam);

    if (error) {
      console.error('Error al actualizar tutor:', error);
      this.mostrarToast('Error al actualizar tutor', 'danger');
    } else {
      this.mostrarToast('Tutor actualizado correctamente');
      setTimeout(() => {
        this.router.navigate(['/tutor']);
      }, 2000);
    }
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
}
