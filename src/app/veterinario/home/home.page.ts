import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:true,
  imports: [IonicModule, RouterModule]
})
export class HomePage implements OnInit {

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    const { data, error } = await this.supabaseService.getClient()
      .from('test')
      .select('*');

    if (error) {
      console.error('Error en la conexión:', error.message);
    } else {
      console.log('Conexión exitosa, datos:', data);
    }
  }

}
