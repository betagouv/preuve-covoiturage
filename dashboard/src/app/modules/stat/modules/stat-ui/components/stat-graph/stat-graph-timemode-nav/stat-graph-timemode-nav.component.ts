import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GraphTimeMode, GraphTimeModeLabel, GraphTimeModeNavList } from '../../../GraphTimeMode';

@Component({
  selector: 'app-stat-graph-timemode-nav',
  templateUrl: './stat-graph-timemode-nav.component.html',
  styleUrls: ['./stat-graph-timemode-nav.component.scss'],
})
export class StatGraphTimeModeNavComponent implements OnInit {
  @Input() nav = GraphTimeMode.Month;
  @Output() navChange = new EventEmitter<GraphTimeMode>();

  @Input() navList = GraphTimeModeNavList;

  constructor() {}

  change(): void {
    this.navChange.emit(this.nav);
  }

  label(navElement: GraphTimeMode): string {
    return GraphTimeModeLabel[navElement];
  }

  ngOnInit(): void {}
}
