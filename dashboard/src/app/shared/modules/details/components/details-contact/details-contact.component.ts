import { Component, Input, OnInit } from '@angular/core';
import { ContactInterface } from '~/shared/common/interfaces/ContactInterface';

@Component({
  selector: 'app-details-contact',
  templateUrl: './details-contact.component.html',
  styleUrls: ['./details-contact.component.scss'],
})
export class DetailsContactComponent implements OnInit {
  @Input() showPhoneNumber = true;
  @Input() contact: ContactInterface;

  constructor() {}

  ngOnInit(): void {}
}
