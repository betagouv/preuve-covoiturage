import { BehaviorSubject, merge, of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs/operators';

import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';

import { DestroyObservable } from '../../../core/components/destroy-observable';

export interface AutocompleteItem {
  _id: number;
  name: string;
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent extends DestroyObservable implements OnInit, ControlValueAccessor {
  @Input() label = 'Filtrer';
  @Input() placeholder = 'Entrer un nom pour filtrer';
  @Input() items$ = new BehaviorSubject<AutocompleteItem[]>([]);
  @ViewChild(MatAutocompleteTrigger) matAutocomplete!: MatAutocompleteTrigger;

  private readonly _PAGE_SIZE = 25;

  private _search = '';
  private _items: AutocompleteItem[] = [];
  private _focusChange = new Subject<Event>();

  public filtered: AutocompleteItem[];
  public search = new FormControl({ value: '', disabled: true });
  public disabled = false;
  public loading = true;
  public result = new BehaviorSubject<number | null>(null);
  public error: string | null = null;
  public control: FormControl; // FormControl used the in client form

  constructor(private ref: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    // listen to focus events on input field
    this._focusChange
      .pipe(
        takeUntil(this.destroy$),
        throttleTime(2000),
        filter(() => this._search === '' && !this.result.getValue()),
      )
      .subscribe(() => {
        this.filtered = this._items.slice(0, this._PAGE_SIZE);
        this.matAutocomplete.openPanel();
      });

    // listen to data and search field updates
    // to filter the items in the list
    // and enable the search field when ready
    merge(
      this.items$.pipe(
        takeUntil(this.destroy$),
        tap((list) => {
          this._items = list;
          this.search.enable();
        }),
      ),
      this.search.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(),
        map((s: any) => (typeof s === 'string' ? s.trim().toLowerCase() : '')),
        tap((s: string) => {
          if (s === '') {
            this._search = '';
            this.filtered = [];
            this.writeValue(null);
            if (this.matAutocomplete) this.matAutocomplete.closePanel();
          }
        }),
        filter((s) => s.length > 2),
        tap((s: string) => {
          this._search = s;
          this.ref.markForCheck();
        }),
      ),
    )
      .pipe(
        switchMap(() =>
          of(this._items.filter((item) => item.name.toLowerCase().includes(this._search)).slice(0, this._PAGE_SIZE)),
        ),
      )
      .subscribe((filtered) => {
        this.filtered = filtered;
        this.loading = false;
        this.ref.markForCheck();
      });
  }

  public onTouch(event?: Event) {}

  public validate(c: FormControl) {
    this.control = c;
    return c.errors;
  }

  public writeValue(item: AutocompleteItem): void {
    this.result.next(item ? item._id : null);
    this.search.setValue(item ? item.name : '');
  }

  public registerOnChange(fn: any): void {
    this.result.subscribe(fn);
  }

  public registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public onSelect(event: MatAutocompleteSelectedEvent) {
    if (!this.disabled) {
      this.writeValue(event.option.value);
    }
  }

  public onIconClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.search.setValue('');
  }

  public onFocus(event: Event): void {
    this._focusChange.next(event);
  }
}
