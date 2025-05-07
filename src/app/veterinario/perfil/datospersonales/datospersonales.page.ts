import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

@Component({
  selector: 'app-datospersonales',
  templateUrl: './datospersonales.page.html',
  styleUrls: ['./datospersonales.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, HeaderComponent]
})
export class DatospersonalesPage implements OnInit {

  form!: FormGroup;
  run!: string;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.run = localStorage.getItem('user_veterinario') || '';

    this.form = this.fb.group({
      run_vet: [{ value: '', disabled: true }, Validators.required],
      nombre_vet: ['', Validators.required],
      apellidos_vet: ['', Validators.required],
      email_vet: ['', [Validators.required, Validators.email]],
      celular_vet: ['', Validators.required]
    });
    this.obtenerDatosVeterinario();
  }

  async obtenerDatosVeterinario() {
    const { data, error } = await this.supabaseService
      .getVeterinario()
      .select('*')
      .eq('run_vet', this.run)
      .single();
  
    if (error) {
      console.error('Error al obtener los datos:', error.message);
    } else if (data) {
      this.form.patchValue(data);
    }
  }
  
  async actualizarDatos() {
    const { error } = await this.supabaseService
      .getVeterinario()
      .update(this.form.getRawValue())
      .eq('run_vet', this.run);
  
    const toast = await this.toastController.create({
      message: error ? 'Error al actualizar datos' : 'Datos actualizados correctamente',
      duration: 2000,
      color: error ? 'danger' : 'success'
    });
    toast.present();
  }
  

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    toast.present();
  }
}
