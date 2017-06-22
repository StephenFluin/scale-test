import { Injectable } from '@angular/core';

@Injectable()
export class PinchService {
    evCache = new Array();
    prevDiff = -1;
    originalDistance;
    originalScale;
    self: PinchService = this;
    scaleData;

    wire(target: HTMLElement, scaleData) {
        target.addEventListener('pointerdown', (event) => { this.pointerdown_handler(event) });

        target.onpointermove = (event) => { this.pointermove_handler(event) };

        target.onpointerup = (event) => { this.pointerup_handler(event) };
        target.onpointercancel = (event) => { this.pointerup_handler(event) };
        target.onpointerout = (event) => { this.pointerup_handler(event) };
        target.onpointerleave = (event) => { this.pointerup_handler(event) };

        this.scaleData = scaleData;


    }
    log(prefix, ev) {
        // console.log(prefix, ev);
    }

    pointerdown_handler(ev) {
        // The pointerdown event signals the start of a touch interaction.
        // This event is cached to support 2-finger gestures
        this.log('pointerDown', ev);
        this.evCache.push(ev);
        if (this.evCache.length === 2) {
            this.originalDistance = this.getDiff();
            this.originalScale = this.scaleData.scale;
        }
    }
    pointermove_handler(ev) {
        // This function implements a 2-pointer horizontal pinch/zoom gesture.
        //
        // If the distance between the two pointers has increased (zoom in),
        // the taget element's background is changed to 'pink' and if the
        // distance is decreasing (zoom out), the color is changed to 'lightblue'.
        //
        // This function sets the target element's border to 'dashed' to visually
        // indicate the pointer's target received a move event.
        this.log('pointerMove', ev);
        ev.target.style.border = 'dashed';
        // Find this event in the cache and update its record with this event
        for (let i = 0; i < this.evCache.length; i++) {
            if (ev.pointerId === this.evCache[i].pointerId) {
                this.evCache[i] = ev;
                break;
            }
        }
        // If two pointers are down, check for pinch gestures
        if (this.evCache.length === 2) {
            // Calculate the distance between the two pointers
            let curDiff = this.getDiff();

            this.scaleData.scale = (this.originalScale * curDiff / this.originalDistance);
            this.scaleData.scale = Math.min(this.scaleData.scale, 5);
            this.scaleData.scale = Math.max(this.scaleData.scale, .1);

            if (this.prevDiff > 0) {
                if (curDiff > this.prevDiff) {
                    // The distance between the two pointers has increased
                    this.log('Pinch moving OUT -> Zoom in', ev);
                    ev.target.style.background = 'pink';
                }
                if (curDiff < this.prevDiff) {
                    // The distance between the two pointers has decreased
                    this.log('Pinch moving IN -> Zoom out', ev);
                    ev.target.style.background = 'lightblue';
                }
            }
            // Cache the distance for the next move event
            this.prevDiff = curDiff;
        }
    }
    pointerup_handler(ev) {
        this.log(ev.type, ev);
        // Remove this pointer from the cache and reset the target's
        // background and border
        this.remove_event(ev);
        ev.target.style.background = 'white';
        ev.target.style.border = '1px solid black';

        // If the number of pointers down is less than two then reset diff tracker
        if (this.evCache.length < 2) {
            this.prevDiff = -1;
        }
    }
    remove_event(ev) {
        // Remove this event from the target's cache
        for (let i = 0; i < this.evCache.length; i++) {
            if (this.evCache[i].pointerId === ev.pointerId) {
                this.evCache.splice(i, 1);
                break;
            }
        }
    }
    getDiff() {
        return Math.sqrt(
            Math.pow(this.evCache[0].clientX - this.evCache[1].clientX, 2) +
            Math.pow(this.evCache[0].clientY - this.evCache[1].clientY, 2));
    }
}
