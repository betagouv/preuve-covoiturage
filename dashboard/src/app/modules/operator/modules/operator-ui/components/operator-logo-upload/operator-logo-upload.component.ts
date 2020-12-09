import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { UtilsService } from '~/core/services/utils.service';

type NullableString = string | null;

const IMG_FORMAT = 'image/png';
const SRC_PREFIX = `data:${IMG_FORMAT};base64,`;

@Component({
  selector: 'app-operator-logo-upload',
  templateUrl: './operator-logo-upload.component.html',
  styleUrls: ['./operator-logo-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OperatorLogoUploadComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorLogoUploadComponent implements OnInit, ControlValueAccessor {
  @ViewChild('logo_file')
  logoBrowser: ElementRef;

  @Output()
  userChange = new EventEmitter();

  public logoImg: NullableString = null;
  public logoSrc: NullableString = null;

  private onTouch = () => {};
  result = new Subject<NullableString>();
  disabled = false;

  constructor(private utils: UtilsService, private cd: ChangeDetectorRef) {}
  ngOnInit(): void {}
  writeValue(logoImg: NullableString, userChange = false): void {
    if (this.logoImg !== logoImg) {
      this.logoImg = logoImg;
      this.logoSrc = logoImg ? `${SRC_PREFIX}${logoImg}` : null;
      this.result.next(logoImg);
      this.cd.detectChanges();
    }

    if (userChange) this.userChange.emit(logoImg);
  }

  @HostListener('blur')
  public onTouched() {
    this.onTouch();
  }

  registerOnChange(fn: any): void {
    this.result.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  browseLogo(e: Event) {
    const file = this.logoBrowser.nativeElement as HTMLInputElement;

    file.click();
    const browseBack = async (e: Event) => {
      file.removeEventListener('input', browseBack);
      if (file.files.length) {
        const croppedImage = await this.utils.cropImageFromFile(file.files[0], 255, 255, IMG_FORMAT);
        // console.log('croppedImage', croppedImage);
        this.writeValue(croppedImage.replace(SRC_PREFIX, ''), true);

        file.value = '';
      }
    };

    file.addEventListener('input', browseBack);

    e.preventDefault();
    e.stopPropagation;
  }

  reset(userChange = false) {
    this.writeValue(null, userChange);
  }
}
