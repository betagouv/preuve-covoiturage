import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certificate-layout',
  templateUrl: './certificate-layout.component.html',
  styleUrls: ['./certificate-layout.component.scss'],
})
export class CertificateLayoutComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  isHomeRoute(): boolean {
    return this.router.url === '/attestation';
  }
}
