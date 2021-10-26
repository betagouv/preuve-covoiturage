import { Component, forwardRef, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

type OperatorId = number;

interface ListOperatorItem {
  _id: OperatorId;
  name: string;
}

interface ResultInterface {
  list: OperatorId[];
  count: number;
}

@Component({
  selector: 'app-operators-checkboxes',
  templateUrl: './operators-checkboxes.component.html',
  styleUrls: ['./operators-checkboxes.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OperatorsCheckboxesComponent),
      multi: true,
    },
  ],
})
export class OperatorsCheckboxesComponent extends DestroyObservable implements OnInit, ControlValueAccessor {
  public form: FormGroup;
  public operators: Array<ListOperatorItem> = [];
  public result = new Subject<ResultInterface>();

  private disabled = false;

  get checkboxes(): any {
    return this.form.controls.boxes as FormArray;
  }

  constructor(private formBuilder: FormBuilder, private commonDataService: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    // init the form
    this.form = this.formBuilder.group({ boxes: new FormArray([]), operator_count: 0 });

    this.commonDataService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators;
      this.operators.forEach(() => this.checkboxes.push(new FormControl(false)));
      this.form.get('operator_count').setValue(this.operators.length);
    });

    // bind checkboxes change
    this.form.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(100)).subscribe(({ boxes }) => {
      // map operators and boxes arrays
      // to get an array of operator _id
      let i = 0;
      const res = new Array(boxes.length);
      for (i = 0; i < boxes.length; i++) {
        if (boxes[i] && this.operators[i]) {
          res.push(this.operators[i]._id);
        }
      }

      this.writeValue({
        list: res.filter((i) => !!i),
        count: boxes.length,
      });
    });
  }

  // select all checkboxes
  public setAll(value: boolean): void {
    this.checkboxes.controls.forEach((chk: FormControl) => chk.setValue(value));
  }

  private onTouch = () => {};

  writeValue(res: ResultInterface): void {
    if (this.disabled) return;
    this.result.next(res);
    this.onTouch();
  }

  registerOnChange(fn: any): void {
    this.result.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
