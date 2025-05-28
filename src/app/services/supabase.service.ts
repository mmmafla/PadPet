import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Método para acceder a 'auth'
  get auth() {
    return this.supabase.auth;
  }

  // Método para acceder a 'from'
  from(tableName: string) {
    return this.supabase.from(tableName);
  }


  async getVeterinario(id_auth: string) {
    const { data, error } = await this.supabase
      .from('veterinario')
      .select('nombre_vet, run_vet, apellidos_vet')
      .eq('id_auth', id_auth)
      .single();
  
    if (error) {
      console.error('Error al obtener veterinario:', error.message);
      throw new Error('No se pudo obtener la información del veterinario.');
    }
  
    return data;
  }
  


async isLoggedIn(): Promise<boolean> {
  const { data, error } = await this.supabase.auth.getUser();
  return !!data.user;
}



  //------------------------ NUEVO VETERINARIO ---------------------------
// Función para registrar un nuevo veterinario
async registrarVeterinario(run: string, nombre: string, apellidos: string, email: string, celular: string, password: string) {
  try {
    // Paso 1: Registrar en Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      console.error('Error al crear usuario en Auth:', authError.message);
      throw new Error('No se pudo registrar el usuario. ' + authError.message);
    }

    const userId = authData.user?.id;

    // Paso 2: Insertar datos en la tabla veterinario
    const { error: insertError } = await this.supabase
      .from('veterinario')
      .insert([
        {
          id_auth: userId,   
          run_vet: run,
          nombre_vet: nombre,
          apellidos_vet: apellidos,
          email_vet: email,
          celular_vet: celular
        }
      ]);

    if (insertError) {
      console.error('Error al insertar veterinario:', insertError);
      throw new Error('No se pudo guardar la información del veterinario. ' + insertError.message);
    }

    console.log('Veterinario registrado correctamente');
    return { success: true };
  } catch (error: any) {
    console.error('Error al registrar veterinario:', error.message);
    throw error;
  }
}

  
  //------------------------ NUEVO VETERINARIO ---------------------------


//------------------------ INICIO DE SESION ---------------------------
async login(email: string, password: string) {
  return await this.supabase.auth.signInWithPassword({ email, password });
}
//------------------------ INICIO DE SESION ---------------------------

//------------------------ CERRAR SESION ---------------------------

async signOut() {
  const { error } = await this.supabase.auth.signOut();
  if (error) {
    console.error('Error al cerrar sesión:', error.message);
    throw new Error('No se pudo cerrar sesión. ' + error.message);
  }
  console.log('Sesión cerrada correctamente');
}
//------------------------ CERRAR SESION ---------------------------



// ------------ obtener region
async obtenerRegiones() {
  try {
    const { data, error } = await this.supabase
      .from('region')
      .select('id_region, nombre_region');
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('Error al obtener regiones:', error);
    return [];
  }
}


}