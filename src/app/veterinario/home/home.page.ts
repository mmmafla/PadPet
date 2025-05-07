import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SupabaseService } from '../../services/supabase.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormularioComponent } from 'src/app/componentes/formulario/formulario.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:true,
  imports: [IonicModule, RouterModule, ReactiveFormsModule, FormularioComponent, CommonModule, HeaderComponent]
})
export class HomePage implements OnInit {

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    const { data, error } = await this.supabaseService.getVeterinario().select('*');

    if (error) {
      console.error('Error en la conexión:', error.message);
    } else {
      console.log('Conexión exitosa, datos:', data);
    }
  }
  

}
