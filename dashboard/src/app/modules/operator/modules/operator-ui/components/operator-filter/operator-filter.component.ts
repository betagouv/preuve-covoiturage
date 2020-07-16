import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-operator-filter',
  templateUrl: './operator-filter.component.html',
  styleUrls: ['./operator-filter.component.scss'],
})
export class OperatorFilterComponent implements OnInit {
  public searchFilters: FormGroup;

  @Output() filterLiteralChange = new EventEmitter();

  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.initSearchForm();
  }

  filter(): void {
    const query = this.searchFilters ? this.searchFilters.controls.query.value.toLowerCase() : '';
    this.filterLiteralChange.emit(query);
  }

  private initSearchForm(): void {
    this.searchFilters = this._fb.group({
      query: [''],
    });

    this.searchFilters.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.filter();
    });
  }
}
