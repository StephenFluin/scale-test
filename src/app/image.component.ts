import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';

// Override type errors
declare var ImageCapture;

@Component({
    selector: 'app-image',
    template: `
    <h1>Photo</h1>
    <button (click)="takePhoto()">Take Photo</button>
    <video *ngIf="!imageUrl" id="preview"></video>
    <img [src]="imageUrl" *ngIf="imageUrl"/>
    <h1>Options</h1>
    <div *ngIf="capabilities">
        <h2>Capabilities</h2>
        {{capabilities | json}}
        <input type="range" [(ngModel)]="settings.zoom" (ngModelChange)="updateSettings()" *ngIf="capabilities.zoom"
            [min]="capabilities.zoom.min"
            [max]="capabilities.zoom.max"
            [step]="capabilities.zoom.step"
            > {{settings.zoom}}
    </div>
<h2>Devices</h2>
<div *ngFor="let device of devices | async" [title]="device | json">{{device.label}}</div>
  `,
    styles: []
})
export class ImageComponent implements OnInit {

    devices: Observable<any[]>;
    imageCapture;
    mediaStreamTrack;
    imageUrl;
    previewUrl;
    capabilities;
    settings: any = {};


    constructor(public sanitizer: DomSanitizer) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => { this.gotMedia(stream) })
            .catch(error => console.error('getUserMedia() error:', error));



        this.devices = Observable.fromPromise(<Promise<any[]>>navigator.mediaDevices.enumerateDevices())
            .map(list => list.filter(item => item.kind === 'videoinput'));
    }

    ngOnInit() {
    }

    gotMedia(mediaStream) {
        this.mediaStreamTrack = mediaStream.getVideoTracks()[0];

        let video = <HTMLMediaElement>document.getElementById('preview');
        video.srcObject = mediaStream;
        video.play();

        this.imageCapture = new ImageCapture(this.mediaStreamTrack);
        setTimeout(() => {

            this.capabilities = this.mediaStreamTrack.getCapabilities();
            console.log(this.capabilities);
            setTimeout(() => { }, 100);

        }, 100);
    }

    takePhoto() {
        this.imageCapture.takePhoto().then(blob => {
            this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        })
    }

    updateSettings() {
        this.mediaStreamTrack.applyConstraints({ advanced: [{ zoom: this.settings.zoom }] })
            .catch(error => console.error('Uh, oh, applyConstraints() error:', error));
    }

}
