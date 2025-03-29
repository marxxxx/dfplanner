import { Component, OnInit } from '@angular/core';
import { EventService, EventItem } from '../../services/event.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectionService } from '../../services/selection.service';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-event-list',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatGridListModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit {
  events: EventItem[] = [];
  selectedEvents: Set<string> = new Set();
  shimmeringIds = new Set<string>();

  selectedDay = '1';

  loading = false;

  constructor(
    private eventService: EventService,
    private selectionService: SelectionService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  onDayChange(day: string) {
    this.selectedDay = day;
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getEvents(this.selectedDay).subscribe((data) => {
      this.events = data;
      this.loading = false;
    });
  }

  toggleSelection(event: EventItem): void {
    this.selectionService.toggleSelection(event.id, this.selectedDay);

    this.shimmeringIds.add(event.id);
    setTimeout(() => this.shimmeringIds.delete(event.id), 800);
  }

  clearSelection() {
    this.selectionService.clear();
  }

  isSelected(id: string): boolean {
    return this.selectionService.isSelected(id);
  }

  getSelectedCount(day: string): number {
    const count = this.selectionService.getSelectedCount(day);
    return count;
  }
}
