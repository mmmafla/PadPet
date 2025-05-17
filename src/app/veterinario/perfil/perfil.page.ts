import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
    standalone:true,
    imports: [IonicModule, RouterModule, HeaderComponent]
})
export class PerfilPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
