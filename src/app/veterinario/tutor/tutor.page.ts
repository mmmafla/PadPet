import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

@Component({
  selector: 'app-tutor',
  templateUrl: './tutor.page.html',
  styleUrls: ['./tutor.page.scss'],
  standalone:true,
  imports: [IonicModule, RouterModule, HeaderComponent]
})
export class TutorPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  abrirAgregarTutor() {
    this.router.navigate(['/veterinario/tutor/agregar-tutor']);
  }

}
