import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-modificar-cita',
  templateUrl: './modificar-cita.page.html',
  styleUrls: ['./modificar-cita.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent]
})
export class ModificarCitaPage implements OnInit {
  id_cita: number | null = null;
  citaForm: FormGroup;
  toastController = inject(ToastController);

  loading = false;

  estadosCita: Array<{ id_estado_cita: number, nombre_estado_cita: string }> = [];

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    const nav = this.router.getCurrentNavigation();
    this.id_cita = nav?.extras?.state?.['id_cita'] || null;

    this.citaForm = this.fb.group({
      fecha_hora_cita: ['', Validators.required],  // Campo datetime ISO string
      comentario_cita: [''],
      id_estado_cita: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.cargarEstadosCita();

    if (this.id_cita) {
      await this.cargarDatosCita(this.id_cita);
    }
  }

  async cargarEstadosCita() {
    const { data, error } = await supabase
      .from('estado_cita')
      .select('id_estado_cita, nombre_estado_cita')
      .order('nombre_estado_cita', { ascending: true });

    if (error) {
      this.mostrarToast('Error al cargar estados de cita', 'danger');
      return;
    }

    this.estadosCita = data || [];
  }

  async cargarDatosCita(id: number) {
    this.loading = true;
    const { data, error } = await supabase
      .from('cita')
      .select('id_cita, fecha_cita, comentario_cita, id_estado_cita')
      .eq('id_cita', id)
      .single();

    if (error || !data) {
      this.mostrarToast('Error al cargar datos de la cita', 'danger');
      this.loading = false;
      return;
    }

    this.citaForm.patchValue({
      fecha_hora_cita: data.fecha_cita,  // ISO datetime completo
      comentario_cita: data.comentario_cita || '',
      id_estado_cita: data.id_estado_cita
    });

    this.loading = false;
  }

  async guardarCambios() {
    if (this.citaForm.invalid || !this.id_cita) {
      this.mostrarToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    this.loading = true;

    const fechaHoraIso: string = this.citaForm.value.fecha_hora_cita;

    const { error } = await supabase
      .from('cita')
      .update({
        fecha_cita: fechaHoraIso,   // guardamos ISO datetime completo
        comentario_cita: this.citaForm.value.comentario_cita,
        id_estado_cita: this.citaForm.value.id_estado_cita
      })
      .eq('id_cita', this.id_cita);

    if (error) {
      this.mostrarToast('Error al guardar los cambios', 'danger');
      this.loading = false;
      return;
    }

    this.mostrarToast('Cita modificada correctamente', 'success');
    this.loading = false;

    this.router.navigate(['/veterinario/agenda/detalle-cita']);
  }

  cancelar() {
    this.router.navigate(['/veterinario/agenda/detalle-cita']);
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
