import { Component, OnInit } from '@angular/core';
import { EventService, EventItem } from '../../services/event.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectionService } from '../../services/selection.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

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
    MatFormFieldModule,
    MatInputModule
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

  showSearch = false;
  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  searchQuery = '';
  onSearchChange(searchQuery: string) {
    if (searchQuery?.trim()) {
      this.events = this.events.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      this.loadEvents();
    }
  }

  isSelected(id: string): boolean {
    return this.selectionService.isSelected(id);
  }

  getSelectedCount(day: string): number {
    const count = this.selectionService.getSelectedCount(day);
    return count;
  }
}
