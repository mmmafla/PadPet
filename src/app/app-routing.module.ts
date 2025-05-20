import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./cuenta/login/login.module').then( m => m.LoginPageModule),

  },
  {
    path: 'nuevacuenta',
    loadChildren: () => import('./cuenta/nuevacuenta/nuevacuenta.module').then( m => m.NuevacuentaPageModule)
  },
  {
    path: 'olvidopass',
    loadChildren: () => import('./cuenta/olvidopass/olvidopass.module').then( m => m.OlvidopassPageModule)
  },
  {
  path: 'nueva-contrasena',
  loadChildren: () => import('./cuenta/olvidopass/nuevacontrasena/nuevacontrasena.module').then(m =>m.NuevacontrasenaPageModule)
},
  {
    path: 'home',
    loadChildren: () => import('./veterinario/home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard] 
  },
  {
    path: 'perfil',
    loadChildren: () => import('./veterinario/perfil/perfil.module').then( m => m.PerfilPageModule),
    canActivate: [AuthGuard] 
  },
  {
    path: 'tutor',
    loadChildren: () => import('./veterinario/tutor/tutor.module').then( m => m.TutorPageModule),
    canActivate: [AuthGuard] 
  },
  {
    path: 'agenda',
    loadChildren: () => import('./veterinario/agenda/agenda.module').then( m => m.AgendaPageModule),
    canActivate: [AuthGuard] 
  },
  {
    path: 'datospersonales',
    loadChildren:() => import('./veterinario/perfil/datospersonales/datospersonales.module').then( m => m.DatospersonalesPageModule),
    canActivate: [AuthGuard] 
  },
  {
    path: 'datosprofesionales',
    loadChildren:() => import('./veterinario/perfil/datosprofesionales/datosprofesionales.module').then( m => m.DatosprofesionalesPageModule),
    canActivate: [AuthGuard] 
  },
  {
    path: 'datosatencion',
    loadChildren: () => import('./veterinario/datosatencion/datosatencion.module').then( m => m.DatosatencionPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
