import { Component, Input, OnInit } from '@angular/core';

import { Contact } from '~/core/entities/shared/contact';

@Component({
  selector: 'app-details-contact',
  templateUrl: './details-contact.component.html',
  styleUrls: ['./details-contact.component.scss'],
})
export class DetailsContactComponent implements OnInit {
  @Input() showPhoneNumber = true;
  @Input() contact: Contact;

  constructor() {}

  ngOnInit() {}
}
