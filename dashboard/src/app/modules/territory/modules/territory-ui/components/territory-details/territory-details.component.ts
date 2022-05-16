import { Component, Input } from '@angular/core';
import { TerritoryInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { ResultInterface as CompanyInterface } from '~/shared/company/find.contract';

@Component({
  selector: 'app-territory-details',
  templateUrl: './territory-details.component.html',
  styleUrls: ['./territory-details.component.scss'],
})
export class TerritoryDetailsComponent {
  @Input() territory: TerritoryInterface;
  @Input() displayContacts = true;
  @Input() company: CompanyInterface;

  constructor() {}
}
