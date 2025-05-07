import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:true,
  imports: [IonicModule, RouterModule, CommonModule]
})
export class HeaderComponent  implements OnInit {

  @Input() title!: string;
  @Input()backButton!: string;

  isAuthenticated : boolean = false;


  supabaseService = inject(SupabaseService);


  async ngOnInit() {
    this.isAuthenticated = await this.supabaseService.isLoggedIn();
  }
  
  

}
