import { Component, OnInit } from '@angular/core';
import { EventService, EventItem } from '../../services/event.service';
import { SelectionService } from '../../services/selection.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-calendar-view',
  imports: [CommonModule, MatListModule, MatProgressSpinnerModule],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {
  loading = false;
  groupedEvents: { [day: string]: EventItem[] } = {};
  get groupedEventKeys() {
    return Object.keys(this.groupedEvents)
  }

  constructor(
    private eventService: EventService,
    private selectionService: SelectionService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const selectedIds = this.selectionService.getSelected();
    const observables = [];

    for (let day = 1; day <= 6; day++) {
      observables.push(
        this.eventService.getEvents(day.toString()).pipe(
          map(events =>
            events
              .filter(e => selectedIds.has(e.id))
              .map(e => ({ ...e, day }))
          )
        )
      );
    }

    forkJoin(observables).subscribe(results => {
      results.forEach((events: EventItem[], index: number) => {
        this.loading = false;
        if (events.length) {
          this.groupedEvents[`Day ${index + 1}`] = events.sort((a, b) =>
            a.time.localeCompare(b.time)
          );
        }
      });
    });
  }
}
