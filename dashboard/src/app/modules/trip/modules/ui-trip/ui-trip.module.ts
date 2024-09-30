import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../../../../shared/modules/material/material.module";
import { SharedModule } from "../../../../shared/shared.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, SharedModule],
  exports: [],
})
export class UiTripModule {}
