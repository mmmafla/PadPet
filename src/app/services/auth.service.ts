import { Injectable } from '@angular/core';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase'; // Importar el auth ya inicializado

@Injectable({ providedIn: 'root' })
export class AuthService {
  async loginWithGoogle(): Promise<string> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');

    try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        if (!accessToken) {
        throw new Error('No se obtuvo el token de acceso');
        }

        return accessToken;
    } catch (error) {
        console.error('Error al iniciar sesión con Google:', error);
        throw error;
    }
    }

}
