
this.zoomUpBtn = document.getElementById('zoomUpBtn');
this.zoomDownBtn = document.getElementById('zoomDownBtn');
this.simulateAltKeyBtn = document.getElementById('simulateAltKeyBtn');

this.zoomUpBtnHeld = false;
this.zoomDownBtnHeld=false;
this.simulateAltKeyBtnHeld=false;

const that = this;
this.zoomUpBtn.addEventListener('touchstart', (event) => { that.zoomUpBtnHeld = true; })
this.zoomUpBtn.addEventListener('touchend', (event) => { that.zoomUpBtnHeld = false; })
this.zoomUpBtn.addEventListener('mousedown', (event) => { that.zoomUpBtnHeld = true;})
this.zoomUpBtn.addEventListener('mouseup', (event) => { that.zoomUpBtnHeld = false; })

this.zoomDownBtn.addEventListener('touchstart', (event) => { that.zoomDownBtnHeld = true;  })
this.zoomDownBtn.addEventListener('touchend', (event) => { that.zoomDownBtnHeld = false; })
this.zoomDownBtn.addEventListener('mousedown', (event) => { that.zoomDownBtnHeld = true; })
this.zoomDownBtn.addEventListener('mouseup', (event) => { that.zoomDownBtnHeld = false; })

this.simulateAltKeyBtn.addEventListener('touchstart', (event) => { that.simulateAltKeyBtnHeld = true; })
this.simulateAltKeyBtn.addEventListener('touchend', (event) => { that.simulateAltKeyBtnHeld = false; })
this.simulateAltKeyBtn.addEventListener('mousedown', (event) => { that.simulateAltKeyBtnHeld = true; })
this.simulateAltKeyBtn.addEventListener('mouseup', (event) => { that.simulateAltKeyBtnHeld = false; })

// loop
function loopForKeepPressingBtn() {
    if (this.zoomUpBtnHeld) this.manuallyZoom(10);
    if (this.zoomDownBtnHeld) this.manuallyZoom(-10);
    if (this.simulateAltKeyBtnHeld) this.simulateAltKeyPress();

    window.requestAnimationFrame(loopForKeepPressingBtn);
}

window.requestAnimationFrame(loopForKeepPressingBtn)