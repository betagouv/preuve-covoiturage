import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-campaign-insee-filter-start-end-form',
  templateUrl: './campaign-insee-filter-start-end-form.component.html',
  styleUrls: ['./campaign-insee-filter-start-end-form.component.scss'],
})
export class CampaignInseeFilterStartEndFormComponent implements OnInit {
  @Input() startEndFormGroup: FormGroup;
  @Input() filterType: 'blackList' | 'whiteList';

  constructor() {}

  ngOnInit() {}
}
