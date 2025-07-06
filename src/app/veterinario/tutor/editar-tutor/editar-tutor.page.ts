import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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
  idTutorParam: string = '';
  tutorActual: any;

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
  ) {}

  async ngOnInit() {
    this.tutorForm = this.fb.group({
      run_tutor: ['', [Validators.required, this.rutValidator]],
      nombre_tutor: ['', Validators.required],
      apellidos_tutor: ['', Validators.required],
      direccion_tutor: [''],
      correo_tutor: [''],
      celular_tutor: ['', [Validators.required, Validators.maxLength(11)]],
      id_region: ['', Validators.required],
      id_ciudad: ['', Validators.required]
    });

    this.idTutorParam = this.route.snapshot.paramMap.get('idTutor') || '';
    if (this.idTutorParam) {
      await this.cargarTutor(this.idTutorParam);
    }

    await this.cargarRegiones();
  }

  async cargarTutor(idTutor: string) {
    const { data, error } = await supabase
      .from('tutor')
      .select('*')
      .eq('id_tutor', idTutor)
      .single();

    if (error) {
      console.error('Error al cargar tutor:', error);
      this.mostrarToast('Error al cargar tutor', 'danger');
      return;
    }

    this.tutorActual = data;

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

  async cargarRegiones() {
    const { data, error } = await supabase.from('region').select('*');
    if (error) {
      console.error('Error al cargar regiones:', error);
      this.mostrarToast('Error al cargar regiones', 'danger');
      return;
    }
    this.regiones = data;
  }

  async cargarCiudades() {
    const regionId = this.tutorForm.get('id_region')?.value;
    if (regionId) {
      const { data, error } = await supabase
        .from('ciudad')
        .select('*')
        .eq('id_region', regionId);

      if (error) {
        console.error('Error al cargar ciudades:', error);
        this.mostrarToast('Error al cargar ciudades', 'danger');
        return;
      }

      this.ciudades = data;
    } else {
      this.ciudades = [];
    }
  }

  async guardarCambios() {
    if (this.tutorForm.invalid) {
      this.mostrarToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    const tutorActualizado = this.tutorForm.getRawValue();

    const { error } = await supabase
      .from('tutor')
      .update(tutorActualizado)
      .eq('id_tutor', this.idTutorParam);

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

  async eliminarTutor() {
    const id_tutor = this.idTutorParam;

    const { data: mascotas, error } = await supabase
      .from('mascota')
      .select('id_masc')
      .eq('id_tutor', id_tutor);

    if (error) {
      this.mostrarToast('No se puede verificar mascotas asociadas', 'danger');
      return;
    }

    if (mascotas.length > 0) {
      this.mostrarToast('No puedes eliminar un tutor con mascotas registradas.', 'warning');
      return;
    }

    const toast = await this.toastController.create({
      message: '¿Deseas eliminar este tutor? Esta acción no se puede deshacer.',
      position: 'middle',
      color: 'danger',
      duration: 0,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sí',
          handler: async () => {
            const { error: deleteError } = await supabase
              .from('tutor')
              .delete()
              .eq('id_tutor', id_tutor);

            if (deleteError) {
              this.mostrarToast('Error al eliminar tutor: ' + deleteError.message, 'danger');
            } else {
              this.mostrarToast('Tutor eliminado correctamente', 'success');
              this.router.navigate(['/tutor']);
            }
          },
        },
      ],
    });

    await toast.present();
  }

  rutValidator(control: AbstractControl) {
    const run = control.value;
    if (!run) return null;

    const rut = run.toString().replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (rut.length < 2) return { invalidRut: true };

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalc = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    if (dv !== dvCalc) {
      return { invalidRut: true };
    }

    return null;
  }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'middle',
    });
    toast.present();
  }
}
