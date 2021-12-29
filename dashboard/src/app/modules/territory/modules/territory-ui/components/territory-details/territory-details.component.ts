import { Component, Input } from '@angular/core';
import { TerritoryInterface } from '../../../../../../../../../shared/territory/common/interfaces/TerritoryInterface';
import { CompanyV2 } from '../../../../../../core/entities/shared/companyV2';

@Component({
  selector: 'app-territory-details',
  templateUrl: './territory-details.component.html',
  styleUrls: ['./territory-details.component.scss'],
})
export class TerritoryDetailsComponent {
  @Input() territory: TerritoryInterface;
  @Input() displayContacts = true;
  @Input() company: CompanyV2;

  constructor() {}
}
