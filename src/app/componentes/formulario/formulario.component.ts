import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule], 
})
export class FormularioComponent  implements OnInit {
  @Input() control!: FormControl;
  @Input() type!: string;
  @Input() label!: string;
  @Input() autocomplete!: string ;
  @Input() icon!: string;

  isPassw!: boolean;
  hide: boolean = true;

  constructor() { }

  ngOnInit() {
        // Determinar si el campo es una contraseña
        if (this.type === 'password') this.isPassw = true;
      }
    
      // Alternar visibilidad de la contraseña
      showOrHidePassw() {
        this.hide = !this.hide;
        this.type = this.hide ? 'password' : 'text';
      }
  

}
