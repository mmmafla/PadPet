import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {


  private VET_KEY = 'user_veterinario';

  constructor() {}

  // Guardar datos del veterinario
  setVeterinario(data: any): void {
    localStorage.setItem(this.VET_KEY, JSON.stringify(data));
  }

// Obtener datos del veterinario
getVeterinario(): any | null {
  const data = localStorage.getItem(this.VET_KEY);
  return data ? JSON.parse(data) : null;
}

// Eliminar datos del veterinario (para logout)
clearVeterinario(): void {
  localStorage.removeItem(this.VET_KEY);
}

  // Limpiar todo (si lo necesitas)
  clearAll(): void {
    localStorage.clear();
  }


}
