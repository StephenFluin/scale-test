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
    <style>
        h1 {color:green;}
        .page {
            display:flex;
            flex-direction:column;
            justify-content:center;
            width:100vw;
            height:100vh;
        }
        img, video {
            max-width:100%;
        }
        section {
            padding: 16px;
        }
    </style>
    <div class="page">
         <div style="display:flex;padding:0px;position:absolute;top:0px;bottom:0px;">
            <video *ngIf="!imageUrl" id="preview" (click)="takePhoto()"></video>
            <img [src]="imageUrl" *ngIf="imageUrl"/>
        </div>
        <div style="position:absolute;top:0px;bottom:0px;">
            <section>
                <h1>Photo</h1>
                <button (click)="takePhoto()">Take Photo</button><button (click)="activateCamera(camera)">Clear</button>
            </section>
            <section style="flex-grow:1"></section>
            <section>
                <h1>Options</h1>
                <div *ngIf="capabilities">
                    <h2>Capabilities</h2>
                    <!--{{capabilities | json}}-->
                    <input type="range" [(ngModel)]="settings.zoom" (ngModelChange)="updateSettings()" *ngIf="capabilities.zoom"
                        [min]="capabilities.zoom.min"
                        [max]="capabilities.zoom.max"
                        [step]="capabilities.zoom.step"
                        > {{settings.zoom}}
                </div>
                <h2>Devices</h2>

                <div *ngFor="let device of devices | async" [title]="device | json">
                    <label>
                        <input [value]="device.deviceId"
                            type="radio"
                            [(ngModel)]="camera"
                            title="device"
                            (ngModelChange)="activateCamera(camera)">
                        {{device.label}}
                    </label>
                </div>
            </section>
        </div>
    </div>
  `,
    styles: []
})
export class ImageComponent {

    devices: Observable<any[]>;
    imageCapture;
    mediaStreamTrack;
    imageUrl;
    previewUrl;
    capabilities;
    camera;
    settings: any = {};


    constructor(public sanitizer: DomSanitizer) {
        this.activateCamera();




        this.devices = Observable.fromPromise(<Promise<any[]>>navigator.mediaDevices.enumerateDevices())
            .map(list => list.filter(item => item.kind === 'videoinput'));
    }
    activateCamera(camera = null) {
        this.imageUrl = null;
        navigator.mediaDevices.getUserMedia({ video: { deviceId: camera ? { exact: camera } : undefined } })
            .then((stream) => { this.gotMedia(stream) })
            .catch(error => console.error('getUserMedia() error:', error));
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

        }, 500);
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
