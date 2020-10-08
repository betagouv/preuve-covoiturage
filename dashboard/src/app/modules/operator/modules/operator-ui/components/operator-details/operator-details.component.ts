import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { Operator } from '~/core/entities/operator/operator';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-operator-details',
  templateUrl: './operator-details.component.html',
  styleUrls: ['./operator-details.component.scss'],
})
export class OperatorDetailsComponent extends DestroyObservable implements OnInit, OnChanges {
  @Input() public operator: Operator;
  @Input() displayContacts = true;

  constructor(public authService: AuthenticationService, private fb: FormBuilder, private toastr: ToastrService) {
    super();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['operator']) {
      this.setOperatorDetails(new Operator(changes['operator'].currentValue));
    }
  }

  private setOperatorDetails(operator: Operator): void {
    this.operator = operator.toFormValues();
  }
}
