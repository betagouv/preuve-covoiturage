import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SelectItem, MessageService } from 'primeng/api';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { AomService } from '~/modules/aom/services/aomService';

import { OperatorService } from '../../services/operatorService';

interface UiListBoxAomItemValue {
  id: string;
  name: string;
}

interface UiListBoxAomItem {
  label: string;
  value: UiListBoxAomItemValue;
}

@Component({
  templateUrl: 'template.html',
  styleUrls: ['./style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OperatorAomVisibilityComponent implements OnInit {
  operator: string;
  listAom: SelectItem[] = [];
  originalSelection: UiListBoxAomItemValue[] = [];
  selectedAom: UiListBoxAomItemValue[] = [];

  constructor(
    private aomService: AomService,
    private operatorService: OperatorService,
    private authService: AuthenticationService,
    private messageService: MessageService,
  ) {
    const { operator } = this.authService.getUser() || { operator: null };
    this.operator = operator;
  }

  ngOnInit() {
    // get the list of AOM
    this.aomService.get([['limit', '1000']]).subscribe((response: ApiResponse) => {
      this.listAom = response.data
        .map((aom) => {
          const value: UiListBoxAomItemValue = {
            id: aom._id,
            name: aom.name,
          };

          // map authorised operators to an array of IDs
          const authorised = (aom.authorised || []).map((a: any) => a._id);

          // select AOM current op is in the list
          if (this.operator && authorised.indexOf(this.operator) > -1) {
            this.selectedAom.push(value);
          }

          return {
            value,
            label: aom.name + (aom.acronym ? ` (${aom.acronym})` : ''),
          };
        })
        .sort((a: UiListBoxAomItem, b: UiListBoxAomItem) => {
          const A = a.label.toUpperCase();
          const B = b.label.toUpperCase();
          return A < B ? -1 : A > B ? 1 : 0;
        });

      // duplicate the list to keep the original selection
      this.originalSelection = [...this.selectedAom];
    });
  }

  selectedAomInline() {
    return this.selectedAom.map((a: UiListBoxAomItemValue): string => a.name).join(', ');
  }

  reset() {
    this.selectedAom = [...this.originalSelection];
  }

  save() {
    const orgId = this.selectedAom.map((a: UiListBoxAomItemValue) => a.id);
    this.operatorService.addAuthorisations(this.operator, orgId).subscribe((response: ApiResponse) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Liste mise à jour',
      });
    });
  }
}
