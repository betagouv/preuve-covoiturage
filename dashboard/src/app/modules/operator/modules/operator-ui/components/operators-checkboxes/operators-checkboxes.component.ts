import { Component, forwardRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';

type OperatorId = number;

export interface ListOperatorItem {
  _id: OperatorId;
  name: string;
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
export class OperatorsCheckboxesComponent extends DestroyObservable implements OnInit {
  public form: FormGroup;
  public operators: Array<ListOperatorItem> = [];
  public selectedOperators: ListOperatorItem[] = [];

  get checkboxes(): any {
    return this.form.controls.boxes as FormArray;
  }

  get checkBoxForm(): any {
    return this.form;
  }

  constructor(private fb: FormBuilder, private commonDataService: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({ boxes: new FormArray([]) });

    this.commonDataService.operators$
      .pipe(
        takeUntil(this.destroy$),
        filter((op) => op != null),
      )
      .subscribe((operators) => {
        this.operators = operators;
        this.operators.forEach(() => this.checkboxes.push(new FormControl(true)));
      });

    this.form.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(100)).subscribe(({ boxes }) => {
      this.selectedOperators = [];
      for (let i = 0; i < boxes.length; i++) {
        if (boxes[i] && this.operators[i]) {
          this.selectedOperators.push(this.operators[i]);
        }
      }
    });
  }

  public setAll(value: boolean): void {
    this.checkboxes.controls.forEach((chk: FormControl) => chk.setValue(value));
  }
}
