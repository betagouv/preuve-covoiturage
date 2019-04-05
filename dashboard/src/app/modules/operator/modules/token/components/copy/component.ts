import { Component, Injectable, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-operator-token-copy',
  templateUrl: 'template.html',
})

@Injectable()
export class OperatorCopyComponent implements OnInit {
  @Input() data: string;
  @Input() text: string = null;
  public rand: string;

  ngOnInit() {
    this.rand = String(Math.floor(Math.random() * (10000)));  // tslint:disable-line
  }

  copy() {
    const input: HTMLInputElement = <HTMLInputElement>document.getElementById('copy' + this.rand);
    input.style.display = 'block';
    input.select();
    document.execCommand('copy');
    input.style.display = 'none';
  }
}
