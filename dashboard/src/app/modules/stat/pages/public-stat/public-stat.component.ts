import { get } from "lodash-es";
import { Component, OnInit, Input } from "@angular/core";
import { takeUntil } from "rxjs/operators";

import { StatNavName } from "~/core/types/stat/statDataNameType";
import { StatNumber } from "~/core/entities/stat/statNumber";
import { statNumbers } from "~/modules/stat/config/statNumbers";
import { URLS } from "~/core/const/main.const";
import { PUBLIC_STATS } from "~/modules/stat/config/stat";
import { StatPublicService } from "~/modules/stat/services/stat-public.service";
import { DestroyObservable } from "~/core/components/destroy-observable";

@Component({
  selector: "app-public-stat",
  templateUrl: "./public-stat.component.html",
  styleUrls: ["./public-stat.component.scss"],
})
export class PublicStatComponent extends DestroyObservable {
  gitbookLinkStats = URLS.gitbookLinkStats;

  @Input() statsList = PUBLIC_STATS;

  hideStats = false;

  constructor(private publicStatService: StatPublicService) {
    super();
  }

  get loading(): boolean {
    return this.publicStatService.loading;
  }

  get loaded(): boolean {
    return this.publicStatService.loaded;
  }
}
