import { Component, Input } from '@angular/core';
import { PUBLIC_STATS } from '../../config/stat';

@Component({
  selector: 'app-public-stat',
  templateUrl: './public-stat.component.html',
  styleUrls: ['./public-stat.component.scss'],
})
export class PublicStatComponent {
  @Input() statsList = PUBLIC_STATS;
}
