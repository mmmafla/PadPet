import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // <-- necesario para *ngIf, *ngFor, date
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { HttpClientModule } from '@angular/common/http';

import { AuthService } from 'src/app/services/auth.service';
import { CalendarService } from 'src/app/services/calendar.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    HttpClientModule  // <---- agrega esto
  ]
})

export class AgendaPage implements OnInit {
  events: any[] = [];
  isAuthenticated = false;
  private token: string | null = null;

  constructor(
    private authService: AuthService,
    private calendarService: CalendarService
  ) {}

  async ngOnInit() {
    // Si quieres que cargue automáticamente al iniciar, descomenta:
    // await this.loginWithGoogle();
  }

  async loginWithGoogle() {
    try {
      this.token = await this.authService.loginWithGoogle();
      this.isAuthenticated = !!this.token;

      if (this.token) {
        console.log('Token obtenido:', this.token);
      } else {
        console.warn('No se obtuvo token');
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  }

  getCalendarEvents() {
    if (!this.token) {
      console.warn('No se ha iniciado sesión');
      return;
    }

    this.calendarService.getEvents(this.token).subscribe(
      (res: any) => {
        this.events = res.items || [];
        console.log('Eventos obtenidos:', this.events);
      },
      (error) => {
        console.error('Error al obtener eventos del calendario:', error);
      }
    );
  }
}
