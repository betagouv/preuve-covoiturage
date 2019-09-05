import {
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { MatSpinner } from '@angular/material';

@Directive({
  selector: 'button[appShowSpinner]',
})
export class ButtonSpinnerDirective implements OnInit, OnChanges {
  // tslint:disable-next-line:no-input-rename
  @Input('appShowSpinner') showSpinner: boolean;
  originalInnerHTML: string;
  spinner: MatSpinner;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
  ) {}

  ngOnInit() {
    // Record the button's original text
    this.originalInnerHTML = this.el.nativeElement.querySelector('.mat-button-wrapper').innerHTML;

    // Set the button to maintain the same dimensions, even once we put the spinner inside.
    this.el.nativeElement.style.width = `${(<HTMLElement>this.el.nativeElement).offsetWidth}px`;
    this.el.nativeElement.style.height = `${(<HTMLElement>this.el.nativeElement).offsetHeight}px`;

    // Create the spinner
    const factory = this.componentFactoryResolver.resolveComponentFactory(MatSpinner);
    const componentRef = this.viewContainerRef.createComponent(factory);
    this.spinner = componentRef.instance;

    // Configure the spinner
    this.spinner.strokeWidth = 3;
    this.spinner.diameter = 24;

    // Hide the spinner
    this.renderer.setStyle(this.spinner._elementRef.nativeElement, 'display', 'none');

    // Apply new styles to the button content's container
    const span = <HTMLSpanElement>this.el.nativeElement.querySelector('.mat-button-wrapper');
    this.renderer.setStyle(span, 'display', 'flex');
    this.renderer.setStyle(span, 'align-items', 'center');
    this.renderer.setStyle(span, 'justify-content', 'center');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof changes.showSpinner === 'object' && !changes.showSpinner.isFirstChange()) {
      if (changes.showSpinner.currentValue === true) {
        // Record the button's original text
        this.originalInnerHTML = this.el.nativeElement.querySelector('.mat-button-wrapper').innerHTML;

        // Clear the button's text
        const span = <HTMLSpanElement>this.el.nativeElement.querySelector('.mat-button-wrapper');
        span.innerText = '';

        // Append the spinner
        this.renderer.appendChild(this.el.nativeElement.firstChild, this.spinner._elementRef.nativeElement);

        // Show the spinner
        this.renderer.setStyle(this.spinner._elementRef.nativeElement, 'display', 'inherit');
      }

      if (changes.showSpinner.currentValue === false) {
        // Hide the spinner
        this.renderer.setStyle(this.spinner._elementRef.nativeElement, 'display', 'none');

        // Remove the spinner
        this.renderer.removeChild(this.el.nativeElement.firstChild, this.spinner._elementRef.nativeElement);

        const span = <HTMLSpanElement>this.el.nativeElement.querySelector('.mat-button-wrapper');
        span.innerHTML = this.originalInnerHTML;
      }

      this.el.nativeElement.disabled = changes.showSpinner.currentValue;
    }
  }
}
