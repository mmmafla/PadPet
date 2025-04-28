import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./cuenta/login/login.module').then( m => m.LoginPageModule)
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
    path: 'home',
    loadChildren: () => import('./veterinario/home/home.module').then( m => m.HomePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
