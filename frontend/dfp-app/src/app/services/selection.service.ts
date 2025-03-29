import { Injectable } from '@angular/core';

const STORAGE_KEY = 'selectedEventIds';
const STORAGE_KEY_BY_DAY = 'selectedEventIdsByDay';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private selected = new Set<string>();
  private selectedByDay = new Map<string, Set<string>>();

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.selected = new Set(JSON.parse(saved));
    }

    const savedByDay = localStorage.getItem(STORAGE_KEY_BY_DAY);
    if (savedByDay) {
      const parsedByDay = JSON.parse(savedByDay);
      for (const day in parsedByDay) {
        this.selectedByDay.set(day, new Set(parsedByDay[day]));
      }
    }
  }

  getSelected(): Set<string> {
    return new Set(this.selected);
  }

  getSelectedCount(day: string): number {
    const selectedForDay = this.selectedByDay.get(day);
    return selectedForDay ? selectedForDay.size : 0;
  }

  isSelected(id: string): boolean {
    return this.selected.has(id);
  }

  toggleSelection(id: string, day: string): void {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
    this.save();
    this.updateSelectedByDay(id, day);
  }

  clear(): void {
    this.selected.clear();
    this.save();
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.selected)));
  }

  private updateSelectedByDay(id: string, day: string): void {
    if (!this.selectedByDay.has(day)) {
      this.selectedByDay.set(day, new Set());
    }

    const selectedForDay = this.selectedByDay.get(day)!;

    if (selectedForDay.has(id)) {
      selectedForDay.delete(id);
    } else {
      selectedForDay.add(id);
    }

    localStorage.setItem(STORAGE_KEY_BY_DAY, JSON.stringify(Object.fromEntries(this.selectedByDay)));
  }
}
