import { Injectable } from '@angular/core';

const STORAGE_KEY = 'selectedEventIds';

interface SelectionItem {
  id: string;
  day: string;
}

@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  private selected: SelectionItem[] = [];

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.selected = JSON.parse(saved);
    }
  }

  getSelected(): Set<string> {
    return new Set(this.selected.map((item) => item.id));
  }

  getSelectedCount(day: string): number {
    return this.selected.filter(s => s.day === day).length;
  }

  isSelected(id: string): boolean {
    return this.selected.find(s=> s.id == id) != null;
  }

  toggleSelection(id: string, day: string): void {
    const index = this.selected.findIndex(item => item.id === id && item.day === day);
    if (index !== -1) {
      this.selected.splice(index, 1);
    } else {
      this.selected.push({ id, day });
    }
    this.save();
  }

  clear(): void {
    this.selected = [];
    this.save();
  }

  private save(): void {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.selected)
    );
  }
}
