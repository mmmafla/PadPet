import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecetasPage } from './recetas.page';

const routes: Routes = [
  {
    path: '',
    component: RecetasPage
  },  {
    path: 'agregar-receta',
    loadChildren: () => import('./agregar-receta/agregar-receta.module').then( m => m.AgregarRecetaPageModule)
  },
  {
    path: 'detalle-receta',
    loadChildren: () => import('./detalle-receta/detalle-receta.module').then( m => m.DetalleRecetaPageModule)
  },
  {
    path: 'modificar-receta',
    loadChildren: () => import('./modificar-receta/modificar-receta.module').then( m => m.ModificarRecetaPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecetasPageRoutingModule {}
