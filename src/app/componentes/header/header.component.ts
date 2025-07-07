import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule]
})
export class HeaderComponent implements OnInit {

  @Input() title!: string;
  @Input() backButton: string = '';

  isAuthenticated: boolean = false;
  mostrarMenu: boolean = false;

  supabaseService = inject(SupabaseService);

  async ngOnInit() {
    const sessionResult = await this.supabaseService.getSession();
    const session = sessionResult.data.session;

    this.isAuthenticated = !!session;

    if (this.isAuthenticated) {
      const userId = session?.user?.id;
      const { data: vetData, error } = await this.supabaseService
        .from('veterinario')
        .select('estado_solicitud')
        .eq('id_auth', userId)
        .single();

      if (!error && vetData?.estado_solicitud == 1) {
        console.log('Estado es 1, habilitando menú');
        this.mostrarMenu = true;
      } else {
        console.log('Estado NO es 1 o error al obtener:', vetData, error);
      }

    }
  }
}