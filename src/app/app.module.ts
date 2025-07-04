import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment.prod';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioComponent } from './componentes/formulario/formulario.component';
import { HeaderComponent } from './componentes/header/header.component';
import { ChartComponent } from './componentes/chart/chart.component';
import { HttpClientModule } from '@angular/common/http'; // ✅ Importación agregada

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    FormularioComponent,
    HeaderComponent,
    ChartComponent,
    HttpClientModule // ✅ Módulo agregado a imports
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
