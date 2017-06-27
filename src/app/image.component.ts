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
    <div class="page" style="background-color:black;">
         <div style="display:flex;padding:0px;position:absolute;top:0px;bottom:0px;justify-contents:center;align-items:center;width:100%;">
            <video *ngIf="!imageUrl" id="preview" (click)="takePhoto()"></video>
            <img [src]="imageUrl" *ngIf="imageUrl"/>
        </div>
        <div style="position:absolute;top:0px;bottom:0px;display:flex;flex-direction: column;width:100%;">
            <section>
                <button *ngIf="!imageUrl" (click)="takePhoto()">Take Photo</button>
                <button *ngIf="imageUrl" (click)="activateCamera()" >Clear</button>
            </section>
            <section style="flex-grow:1"></section>
            <section>
                <div *ngIf="capabilities">
                    <input type="range"
                    *ngIf="capabilities.zoom"
                    style="transform: rotate(-90deg);position: absolute;right: -35px;top: 50%;"
                    [(ngModel)]="settings.zoom"
                    (ngModelChange)="updateSettings()"
                    [min]="capabilities.zoom.min"
                    [max]="capabilities.zoom.max"
                    [step]="capabilities.zoom.step"
                        >
                </div>
                <button *ngIf="cameraList && cameraList.length > 1" (click)="switchCamera()">
                    SWAP
                </button>
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

    selectedCameraIndex = 0;
    cameraList;

    settings: any = {};


    constructor(public sanitizer: DomSanitizer) {
        this.activateCamera();




        navigator.mediaDevices.enumerateDevices()
            .then(list => {
                this.cameraList = list.filter(item => item.kind === 'videoinput')
            });
    }
    activateCamera(camera = null) {
        this.imageUrl = null;
        let constraint = { video: { deviceId: camera ? { exact: camera.deviceId } : undefined } };
        console.log("Constraint is",constraint);
        navigator.mediaDevices.getUserMedia(constraint)
            .then((stream) => { this.gotMedia(stream) })
            .catch(error => console.error('getUserMedia() error:', error));
    }
    switchCamera() {
        this.selectedCameraIndex = (this.selectedCameraIndex + 1) % this.cameraList.length;
        console.log("Camera index is now", this.selectedCameraIndex, this.cameraList.length);
        this.activateCamera(this.cameraList[this.selectedCameraIndex]);
        console.log("Trying to select camera", this.selectedCameraIndex, this.cameraList[this.selectedCameraIndex]);
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
