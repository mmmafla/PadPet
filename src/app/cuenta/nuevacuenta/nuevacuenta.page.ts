import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { SupabaseAuthClient } from '@supabase/supabase-js/dist/module/lib/SupabaseAuthClient';
import { FormularioComponent } from 'src/app/componentes/formulario/formulario.component';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { SupabaseService } from 'src/app/services/supabase.service';


interface NuevoVeterinarioForm {
  run: FormControl<string | null>;
  nombre: FormControl<string | null>;
  apellidos: FormControl<string | null>;
  celular: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  confpassword: FormControl<string | null>;
  aceptaTerminos: FormControl<boolean | null>;
}


@Component({
  selector: 'app-nuevacuenta',
  templateUrl: './nuevacuenta.page.html',
  styleUrls: ['./nuevacuenta.page.scss'],
  standalone:true,
  imports: [IonicModule, RouterModule, ReactiveFormsModule, FormularioComponent, CommonModule, HeaderComponent]
})



export class NuevacuentaPage implements OnInit {


  // formulario para crerar nuevo usuario veterinario
  form = new FormGroup<NuevoVeterinarioForm>({
    run: new FormControl(null, [Validators.required]),
    nombre: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    apellidos: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    celular: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required]),
    confpassword: new FormControl(null, [Validators.required]),
    aceptaTerminos: new FormControl(false, Validators.requiredTrue),
  }, { validators: this.passwordsMatch });
  
  
  



  router = inject(Router);
  toastController = inject(ToastController);
  supabaseService = inject(SupabaseService);


  ngOnInit() {}

  async submit() {
    if (!this.validarRUN()) { return; }
  
    const formValue = this.form.value; // Guardar los valores en una variable
  
    // Verificar si los valores del formulario son válidos
    if (!formValue.nombre || !formValue.email || !formValue.celular) {
      this.mostrarToast('Por favor, complete todos los campos requeridos', 'danger');
      return;
    }
  
    const { nombre, apellidos, run, celular, email, password } = formValue;
  
    try {
      // Llamamos a la función registrarVeterinario que definimos en supabaseService
      const resultado = await this.supabaseService.registrarVeterinario(run!, nombre!, apellidos!, email!, celular!,password!);
      
      // Mostrar mensaje de exito
      this.mostrarToast('Veterinario registrado con éxito', 'success');
      
      // Redirigir al veterinario al home
      this.router.navigate(['/home']); 
    } catch (error: any) {  
      this.mostrarToast('Error al registrar veterinario: ' + error.message, 'danger');
    }
  }
  


// --------------------------------------- RUT ---------------------------------------
validarRUN(): boolean {
  const run = this.form.controls.run.value?.toString().replace(/\./g, '').replace('-', '') ?? '';
  if (run.length < 2) {
    this.form.controls.run.setErrors({ invalidRut: true });
    return false;
  }

  const cuerpo = run.slice(0, -1);
  const dv = run.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalc = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  if (dv !== dvCalc) {
    this.form.controls.run.setErrors({ invalidRut: true });
    return false;
  }

  this.form.controls.run.setErrors(null);
  return true;
}


passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confpassword')?.value;
  return password === confirm ? null : { mismatch: true };
}


  // ------------------------------------------------------------------------------------
  // -----------------------------------MENSAJE------------------------------------------
  private  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      position: 'middle',
      duration: 2000,
      color: color
    });
    toast.present();
  }
}
