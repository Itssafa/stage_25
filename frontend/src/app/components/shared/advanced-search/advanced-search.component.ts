import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface SearchField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: any; label: string }[];
}

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.css']
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {
  @Input() fields: SearchField[] = [];
  @Input() placeholder: string = 'Recherche globale...';
  @Output() globalSearchChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  globalSearchValue = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Global search functionality
    this.globalSearchValue.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.globalSearchChange.emit(value || '');
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClearAll() {
    this.globalSearchValue.reset('', { emitEvent: false });
    this.clearSearch.emit();
  }
}