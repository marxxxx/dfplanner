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

@Component({
  selector: 'app-event-list',
  imports: [CommonModule, FormsModule, MatCardModule, MatCheckboxModule, MatGridListModule, MatButtonToggleModule, MatProgressSpinnerModule],
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

  toggleSelection(id: string): void {
    this.selectionService.toggleSelection(id);

    this.shimmeringIds.add(id);
    setTimeout(() => this.shimmeringIds.delete(id), 800);
  }

  isSelected(id: string): boolean {
    return this.selectionService.isSelected(id);
  }
}
