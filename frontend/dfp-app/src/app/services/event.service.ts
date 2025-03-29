import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

export interface EventItem {
  id: string;
  day: number;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  time: string;
  description: string;
  link: string;
  tags: string[];
  venue: string;
  room: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/api/events';
  //private apiUrl = 'https://dfplanxumsynez-dfp-backend.functions.fnc.fr-par.scw.cloud/api/events';

  constructor(private http: HttpClient) {}

  getEvents(day: string): Observable<EventItem[]> {
    const cacheKey = `events_day_${day}`;
    const cacheMetaKey = `${cacheKey}_meta`;

    const cachedData = localStorage.getItem(cacheKey);
    const cachedMeta = localStorage.getItem(cacheMetaKey);

    if (cachedData && cachedMeta) {
      const meta = JSON.parse(cachedMeta);
      const age = Date.now() - meta.timestamp;

      if (age < 24 * 60 * 60 * 1000) {
        // Use cached data if it's less than a day old
        const parsed = JSON.parse(cachedData);
        return of(parsed);
      }
    }

    // Fetch from backend if no valid cache
    return this.http.get<EventItem[]>(`${this.apiUrl}?day=${day}`).pipe(
      tap(events => {
        localStorage.setItem(cacheKey, JSON.stringify(events));
        localStorage.setItem(cacheMetaKey, JSON.stringify({ timestamp: Date.now() }));
      })
    );
  }
}
