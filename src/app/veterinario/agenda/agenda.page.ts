import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
    standalone:true,
    imports: [IonicModule, RouterModule, HeaderComponent]
  
})
export class AgendaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
