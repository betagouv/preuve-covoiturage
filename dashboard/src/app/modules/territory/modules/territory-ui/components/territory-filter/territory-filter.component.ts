import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-territory-filter',
  templateUrl: './territory-filter.component.html',
  styleUrls: ['./territory-filter.component.scss'],
})
export class TerritoryFilterComponent implements OnInit {
  public searchFilters: FormGroup;

  @Output() filterLiteralChange = new EventEmitter();

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this.initSearchForm();
  }

  filter() {
    const query = this.searchFilters ? this.searchFilters.controls.query.value.toLowerCase() : '';
    this.filterLiteralChange.emit(query);
  }

  private initSearchForm() {
    this.searchFilters = this._fb.group({
      query: [''],
    });

    this.searchFilters.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe((value) => {
        this.filter();
      });
  }
}
