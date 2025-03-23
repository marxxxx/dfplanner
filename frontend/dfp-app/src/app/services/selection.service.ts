import { Injectable } from '@angular/core';

const STORAGE_KEY = 'selectedEventIds';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private selected = new Set<string>();

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.selected = new Set(JSON.parse(saved));
    }
  }

  getSelected(): Set<string> {
    return new Set(this.selected);
  }

  isSelected(id: string): boolean {
    return this.selected.has(id);
  }

  toggleSelection(id: string): void {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
    this.save();
  }

  clear(): void {
    this.selected.clear();
    this.save();
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.selected)));
  }
}
