const fabric = require('./fabric.js');



// const canvas = document.getElementById("tophalf")
// var isDrawing = false;
// var points = [];

// canvas.addEventListener("touchstart", e => {
//   e.preventDefault();

//   if (e.targetTouches.length >= 2) {
//       isDrawing = false;
//   }
//   else {
//       isDrawing = true;
//   }
//   // console.table({
//   //   "Touches": e.touches.length,
//   //   "Target": e.targetTouches.length,
//   //   "Changed": e.changedTouches.length,
//   //   "Drawing": isDrawing,
//   // })
// })

// canvas.addEventListener("touchend", e => {
//   e.preventDefault();
//   // console.table({
//   //   "ETouches": e.touches.length,
//   //   "ETarget": e.targetTouches.length,
//   //   "EChanged": e.changedTouches.length,
//   //   "EDrawing": isDrawing,
//   // })

//   if (e.targetTouches.length == 0) {
//     const currentPosition = getClickPoint(e);
//     points.push({
//         pointId: points.length,
//         x: currentPosition.x,
//         y: currentPosition.y
//     });
//     console.table(points[points.length-1])
//   }

// })



// document.addEventListener("touchstart", e => {
//   ;[...e.changedTouches].forEach(touch => {
//     const dot = document.createElement("div")
//     dot.classList.add("dot")
//     dot.style.top = `${touch.pageY}px`
//     dot.style.left = `${touch.pageX}px`
//     dot.id = touch.identifier
//     document.body.append(dot)



//   })
// })


// document.addEventListener("touchmove", e => {
//   ;[...e.changedTouches].forEach(touch => {
//     const dot = document.getElementById(touch.identifier)
//     dot.style.top = `${touch.pageY}px`
//     dot.style.left = `${touch.pageX}px`
//   })
// })


// document.addEventListener("touchend", e => {
//   ;[...e.changedTouches].forEach(touch => {
//     const dot = document.getElementById(touch.identifier)
//     dot.remove()


//   })
// })


// function getClickPoint(event) {
//   var clickX, clickY;
//   if (event.type === 'mousedown' || event.type === 'mouseup' || event.type === 'mousemove') {
//       clickX = event.offsetX;
//       clickY = event.offsetY;
//   } else if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
//       var touch = event.touches[0] || event.changedTouches[0];
//       const boundaries = canvas.getBoundingClientRect();
//       clickX = Math.round(touch.pageX - boundaries.left - screenX);
//       clickY = Math.round(touch.pageY - boundaries.top - screenY);
//   }
//   return { x: clickX, y: clickY };
// }


var canvas = new fabric.Canvas('c');
fabric.Image.fromURL('../assets/pug_small.jpg', function(img) {
  img.scale(0.5).set({
    left: 150,
    top: 150,
    angle: -15
  });
  canvas.add(img).setActiveObject(img);
});

// add red rectangle
canvas.add(new fabric.Rect({
  width: 50,
  height: 50,
  left: 50,
  top: 50,
  fill: 'rgb(255,0,0)'
}));

// add green, half-transparent circle
canvas.add(new fabric.Circle({
  radius: 40,
  left: 50,
  top: 50,
  fill: 'rgb(0,255,0)',
  opacity: 0.5
}));

var info = document.getElementById('info');

canvas.on({
  'touch:gesture': function() {
    var text = document.createTextNode(' Gesture ');
    info.insertBefore(text, info.firstChild);
  },
  'touch:drag': function() {
    var text = document.createTextNode(' Dragging ');
    info.insertBefore(text, info.firstChild);
  },
  'touch:orientation': function() {
    var text = document.createTextNode(' Orientation ');
    info.insertBefore(text, info.firstChild);
  },
  'touch:shake': function() {
    var text = document.createTextNode(' Shaking ');
    info.insertBefore(text, info.firstChild);
  },
  'touch:longpress': function() {
    var text = document.createTextNode(' Longpress ');
    info.insertBefore(text, info.firstChild);
  }
});
}