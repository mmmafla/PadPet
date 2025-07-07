import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  async canActivate(): Promise<boolean> {
    const session = await this.supabaseService.getSession();
    const isLogged = !!session.data.session;

    if (!isLogged) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}
