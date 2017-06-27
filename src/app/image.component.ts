import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';

// Override type errors
declare var ImageCapture;

@Component({
    selector: 'app-image',
    templateUrl: 'image.component.html',
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

    showFullScreenOption = true;

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
    fullscreen() {
        document.getElementById('pane').webkitRequestFullscreen();
        this.showFullScreenOption = false;

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
