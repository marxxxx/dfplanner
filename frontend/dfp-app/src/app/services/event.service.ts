import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  time: string;
  description: string;
  link: string;
}



@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/api/events';

  constructor(private http: HttpClient) {}

  getEvents(day: string = '1'): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${this.apiUrl}?day=${day}`);
  }
}
