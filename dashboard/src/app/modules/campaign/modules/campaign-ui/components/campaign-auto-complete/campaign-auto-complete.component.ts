import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

export interface CampaignNameInterface {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-campaign-auto-complete',
  templateUrl: './campaign-auto-complete.component.html',
  styleUrls: ['./campaign-auto-complete.component.scss'],
})
export class CampaignAutoCompleteComponent implements OnInit {
  @Input() parentForm: FormGroup;

  // todo: tmp remove
  public campaigns: CampaignNameInterface[] = [
    {
      _id: 'id1',
      name: 'campagne 1',
    },
    {
      _id: 'id2',
      name: 'campagne 2',
    },
  ];

  constructor() {}

  ngOnInit() {}
}
