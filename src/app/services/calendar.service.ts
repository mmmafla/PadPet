import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs'; // Asegúrate de importar esto

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly API_URL = 'https://www.googleapis.com/calendar/v3';

  constructor(private http: HttpClient) {}

  getEvents(accessToken: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const url = `${this.API_URL}/calendars/primary/events?maxResults=20&orderBy=startTime&singleEvents=true`;

    return this.http.get(url, { headers });
  }

  // ✅ Modificada para usar await y ejecutar la solicitud
  async createEvent(accessToken: string, event: any): Promise<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return await firstValueFrom(
      this.http.post(`${this.API_URL}/calendars/primary/events`, event, {
        headers,
      })
    );
  }

  async deleteEvent(accessToken: string, eventId: string): Promise<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return await firstValueFrom(
      this.http.delete(`${this.API_URL}/calendars/primary/events/${eventId}`, {
        headers,
      })
    );
  }
}
