window.ZoneManager = {
    zones: Object,
    firstTime: false,
    isPaintingMode: false,
    isDeleteMode: false,
    Setup: function (base64, dictionary) {
        const bgcanvas = document.getElementById('backgroundcanvas');
        const bgctx = bgcanvas.getContext('2d');
        const canvas = document.getElementById('zoneCanvas');
        const context = canvas.getContext('2d');
        var points = [];
        var centroids= {};
        let isDrawing = false;
        let screenX = 0;
        let screenY = 0;
        var imageObj = new Image();
        let that = this;

        imageObj.src = base64;
        imageObj.onload = function () {
            bgcanvas.width = imageObj.width
            bgcanvas.height = imageObj.height
            canvas.width = imageObj.width
            canvas.height = imageObj.height
            bgctx.drawImage(imageObj, 0, 0);
            oldPolygon();
        };

        function Zone(parent) { }

        Zone.prototype.deleteZone = function (e) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            centroids = [];
            points = [];
            oldPolygon();
        }

        Zone.prototype.addKeepoutZone = function (e) {
            const zonename = 'Zone' + RandomString();
            zones[zonename] = points;
            centroids[zonename] = that.PointsToPolygonCentroid(points);
            points = [];
            oldPolygon();
        }

        Zone.prototype.findClosestZones = function (e) {
            const pointX = e.clientX;
            const pointY = e.clientY;

            // Create Voronoi diagram based on centroids
            const centroidsArr = Object.entries(this.centroids).map(([name, centroid]) => ({ name, centroid }));
            const delaunay = d3.Delaunay.from(
                centroidsArr,
                c => c.centroid[0],
                c => c.centroid[1]
            );
            const voronoi = delaunay.voronoi();

            // Find the closest centroid to the point
            const regionIndex = voronoi.find(pointX, pointY);
            const closestCentroid = centroidsArr[regionIndex];

            const distance = Math.sqrt(
                Math.pow(pointX - closestCentroid.centroid[0], 2) + Math.pow(pointY - closestCentroid.centroid[1], 2)
            );

            // Return the closest centroid, its name, and its distance to the point
            return { name: closestCentroid.name, centroid: closestCentroid.centroid, distance: distance };
        }

        Zone.prototype.findAndDeleteClosestZone = function (e, closeness=20) {
            const { centroid, distance } = Zone.prototype.findClosestZone(e);

            if (distance < closeness) {
                // Find the name of the closest centroid
                const centroidName = Object.keys(centroids).find(name => centroids[name].x === centroid.x && centroids[name].y === centroid.y);

                // Delete the closest zone and its centroid
                delete zones[centroidName];
                delete centroids[centroidName];

                // Return the name of the deleted zone
                return centroidName;
            }

            // If no zone was deleted, return null
            return null;
        }

        Zone.prototype.mouseDown = function (e) {
            //e.preventDefault();

            if (e.type === 'touchstart' && e.touches.length > 1) {
                isDrawing = false;
                return
            }
            else {
                isDrawing = true;
                oldPolygon();
            }
        }
        Zone.prototype.mouseUp = function (e) {
            //e.preventDefault();

            if (isDrawing == true) {
                const currentPosition = getClickPoint(e);
                points.push({
                    pointId: points.length,
                    x: currentPosition.x,
                    y: currentPosition.y
                });
                redraw();
                oldPolygon();
            }
        }


        Zone.prototype.touchStart = function (e) {
            //e.preventDefault();

            if (e.targetTouches.length >= 2) {
                isDrawing = false;
            }
            else {
                isDrawing = true;
            }
            console.table({
                "Touches": e.touches.length,
                "Target": e.targetTouches.length,
                "Changed": e.changedTouches.length,
                "Drawing": isDrawing,
            })
        }
        Zone.prototype.touchEnd = function (e) {
            //e.preventDefault();
            console.table({
                "ETouches": e.touches.length,
                "ETarget": e.targetTouches.length,
                "EChanged": e.changedTouches.length,
                "EDrawing": isDrawing,
            })

            if (isDrawing) {
                const currentPosition = getClickPoint(e);
                points.push({
                    pointId: points.length,
                    x: currentPosition.x,
                    y: currentPosition.y
                });
                console.table(points[points.length - 1])

                redraw();
                oldPolygon();
            }
        }







        function addExistZone(object) {
            Object.entries(object).forEach(([key, value]) => {
                zones[key] = value
            });
        }

        function RandomString() {
            var d = Date.now();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
                d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }

        function oldPolygon() {
            context.fillStyle = 'rgba(255, 218, 185,0.3)';
            context.strokeStyle = "#df4b26";
            context.lineWidth = 1;
            for (var i = 0; i < Object.keys(zones).length; i++) {
                var area = Object.values(zones)[i];
                context.beginPath();
                context.moveTo(area[0].x, area[0].y);
                for (var j = 1; j < area.length; j++) {
                    context.lineTo(area[j].x, area[j].y);
                }
                context.closePath();
                context.fill();
                context.stroke();
            }
        }

        function redraw() {
                canvas.width = canvas.width;
                context.drawImage(imageObj, 0, 0);
                drawNewPolygon();
                drawPoints();
        };

        function drawNewPolygon() {
            context.fillStyle = 'rgba(255,0,0,0.5)';
            context.strokeStyle = "#df4b26";
            context.lineWidth = 1;

            context.beginPath();
            context.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) {
                context.lineTo(points[i].x, points[i].y);
            }
            context.closePath();
            context.fill();
            context.stroke();
        };

        function drawPoints() {
            context.strokeStyle = "#df4b26";
            context.lineJoin = "round";
            context.lineWidth = 5;

            for (var i = 0; i < points.length; i++) {
                context.beginPath();
                context.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI, false);
                context.fillStyle = '#ffffff';
                context.fill();
                context.lineWidth = 5;
                context.stroke();
            }

        };

        window.addEventListener("scroll", function (e) {
            //e.preventDefault();

            screenX = window.screenX
            screenY = window.scrollY;
        });

        function getClickPoint(event) {
            var clickX, clickY;
            if (event.type === 'mousedown' || event.type === 'mouseup' || event.type === 'mousemove') {
                clickX = event.offsetX;
                clickY = event.offsetY;
            } else if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
                var touch = event.touches[0] || event.changedTouches[0];
                const boundaries = canvas.getBoundingClientRect();
                clickX = Math.round(touch.pageX - boundaries.left - screenX);
                clickY = Math.round(touch.pageY - boundaries.top - screenY);
            }
            return { x: clickX, y: clickY };
        }

        zones = new Zone(document.getElementById("maindiv"));
        addExistZone(dictionary);

        const addKeepoutZoneBtn = document.getElementById("AddKeepoutZoneButton");
        addKeepoutZoneBtn.addEventListener('click', e => {
            //e.preventDefault();

            isDrawing = false;
        });
    },

    DeleteMode: function () {
        this.isDeleteMode = !this.isDeleteMode;

        const canvas = document.getElementById('zoneCanvas');
        const deleteZoneBtn = document.getElementById('DeleteZoneButton');
        deleteZoneBtn.addEventListener('mouseup', e => {
            e.preventDefault();
            zones.findClosestZone(e);
        }, false);

        // remove prev event listeners
        canvas.removeEventListener('mouseup', zones.mouseUp, false);
        canvas.removeEventListener('mousedown', zones.mouseDown, false);
        canvas.removeEventListener('touchstart', e => {
            this.turnOffScroll();
            canvas.removeEventListener('mouseup', zones.mouseUp, false);
            canvas.removeEventListener('mousedown', zones.mouseDown, false);
            zones.touchStart(e);
        }, false);
        canvas.removeEventListener('touchend', e => {
            this.turnOnScroll();
            canvas.addEventListener('mouseup', zones.mouseUp, false);
            canvas.addEventListener('mousedown', zones.mouseDown, false);
            zones.touchEnd(e);
        });


        canvas.addEventListener('mouseup', e => {
            e.preventDefault();
            zones.findAndDeleteClosestZone(e);
        }, false);

        deleteZoneBtn.addEventListener('touchend', e => {
            e.preventDefault();
            zones.findClosestZone(e);
        }, false);
        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            zones.findAndDeleteClosestZone(e);
        }, false);

        canvas.addEventListener('click', e => {
            e.preventDefault();
            zones.findClosestZone(e);
        }, false);
    },

    PaintMode: function () {
        this.isPaintingMode = !this.isPaintingMode;

        firstTime = true;
        if (!firstTime) return;


        const canvas = document.getElementById('zoneCanvas');
        const addkeepoutBtn = document.getElementById('AddKeepoutZoneButton');
        const showInfoBtn = document.getElementById('ShowZoneInfoBtn');
        let lastTouchY;
        let that = this;


        canvas.addEventListener('mouseup', zones.mouseUp, false);
        canvas.addEventListener('mousedown', zones.mouseDown, false);
        canvas.addEventListener('touchstart', e => {
            this.turnOffScroll();
            canvas.removeEventListener('mouseup', zones.mouseUp, false);
            canvas.removeEventListener('mousedown', zones.mouseDown, false);
            zones.touchStart(e);
        }, false);
        canvas.addEventListener('touchend', e => {
            this.turnOnScroll();
            canvas.addEventListener('mouseup', zones.mouseUp, false);
            canvas.addEventListener('mousedown', zones.mouseDown, false);
            zones.touchEnd(e);
        }
            , false);

        if (this.isPaintingMode)
            addkeepoutBtn.addEventListener('click', zones.addKeepoutZone, false);

        showInfoBtn.addEventListener('click', () => {
            canvas.removeEventListener('mouseup', zones.mouseUp, false);
            canvas.removeEventListener('mousedown', zones.mouseDown, false);
            canvas.removeEventListener('touchstart', zones.touchStart, false);
            canvas.removeEventListener('touchend', zones.touchEnd, false);
            addkeepoutBtn.removeEventListener('click', zones.click, false);
        })


        // disable scrolling when touch canvas 
        //document.body.addEventListener("touchstart", function (event) {
        //    this.turnOffScroll();

        //    if (event.target == canvas && event.touches.length === 1) {
        //        event.preventDefault();
        //    }
        //    if (event.target == canvas && event.touches.length > 1) {
        //        lastTouchY = Math.round(event.touches[0].pageY - boundaries.top);
        //    }
        //}, { passive: false });
        //document.body.addEventListener("touchend", function (event) {
        //    this.turnOnScroll();

        //    if (event.target == canvas && event.touches.length === 1) {
        //        event.preventDefault();
        //    }
        //    if (event.target == canvas && event.touches.length > 1) {
        //        lastTouchY = Math.round(event.touches[0].pageY - boundaries.top);
        //    }
        //}, { passive: false });
        //document.body.addEventListener("touchmove", function (event) {
        //    this.turnOffScroll();

        //    if (event.target == canvas && event.touches.length === 1) {
        //        event.preventDefault();
        //    }
        //    if (event.target == canvas && event.touches.length > 1) {
        //        lastTouchY = Math.round(event.touches[0].pageY - boundaries.top);
        //    }
        //}, { passive: false });
    },

    GetLastZone: function () {
        var lastZone = {}
        var zoneKey = Object.keys(zones).pop();
        lastZone[zoneKey] = Object.values(zones).pop();
        return (lastZone)
    },

    DeleteZone: function (polygonId) {
        delete zones[polygonId];
        zones.deleteZone()

    },

    DisplayPolygonInfo: function () {
        const canvas = document.getElementById('zoneCanvas');
        const ctx = canvas.getContext("2d");
        ctx.font = "16px Comic Sans MS";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";

        polygonCentroid()

        function polygonCentroid() {
            for (const [zoneName, points] of Object.entries(zones)) {
                centroid = this.PointsToPolygonCentroid(points);
                ctx.fillText(zoneName, centroid.x, centroid.y);
            }
        };
    },

    HideZoneInfo: function () {
        const canvas = document.getElementById('zoneCanvas');
        const context = canvas.getContext("2d");

        drawPolygon()

        function drawPolygon() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'rgba(255, 218, 185,0.3)';
            context.strokeStyle = "#df4b26";
            context.lineWidth = 1;
            for (var i = 0; i < Object.keys(zones).length; i++) {
                var area = Object.values(zones)[i];
                context.beginPath();
                context.moveTo(area[0].x, area[0].y);
                for (var j = 1; j < area.length; j++) {
                    context.lineTo(area[j].x, area[j].y);
                }
                context.closePath();
                context.fill();
                context.stroke();
            }
        }
    },

    turnOffScroll: function (elementId=null) {
        let element =null;
        if (elementId != null) {
            element = document.getElementById(elementId);
        }
        if (element != null) {
            element.classList.add("remove-scrolling");
        } else {
            document.body.classList.add("remove-scrolling");
        }
    }, 

    turnOnScroll: function (elementId=null) {
        let element = null;
        if (elementId != null) {
            element = document.getElementById(elementId);
        }
        if (element != null) {
            element.classList.remove("remove-scrolling");
        } else {
            document.body.classList.remove("remove-scrolling");
        }
    }, 

    PointsToPolygonCentroid: function(points) {
        let centroidX = 0;
        let centroidY = 0;

        for (const point of points) {
            centroidX += point.x;
            centroidY += point.y;
        }

        centroidX /= points.length;
        centroidY /= points.length;

        return { x: centroidX, y: centroidY };
    },

    //turnOnScroll: function (on=true) {
    //    if (on) {
    //        enable_scroll();
    //    } else {
    //        disable_scroll();
    //    }

    //    // PREVENT DEFAULT HANDLER
    //    function preventDefault(e) {
    //        e = e || window.event;
    //        if (e.preventDefault) {
    //            e.preventDefault();
    //        }
    //        e.returnValue = false;
    //    }
    //    // PREVENT SCROLL KEYS
    //    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    //    // left: 37, up: 38, right: 39, down: 40,
    //    // (Source: http://stackoverflow.com/a/4770179)
    //    function keydown(e) {
    //        var keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
    //        for (var i = keys.length; i--;) {
    //            if (e.keyCode === keys[i]) {
    //                preventDefault(e);
    //                return;
    //            }
    //        }
    //    }
    //    // PREVENT MOUSE WHEEL
    //    function wheel(event) {
    //        event.preventDefault();
    //        event.stopPropagation();
    //        return false;
    //    }
    //    // DISABLE SCROLL
    //    function disable_scroll() {
    //        if (document.addEventListener) {
    //            document.addEventListener('wheel', wheel, false);
    //            document.addEventListener('mousewheel', wheel, false);
    //            document.addEventListener('DOMMouseScroll', wheel, false);
    //        }
    //        else {
    //            document.attachEvent('onmousewheel', wheel);
    //        }
    //        document.onmousewheel = document.onmousewheel = wheel;
    //        document.onkeydown = keydown;

    //        //x = window.pageXOffset || document.documentElement.scrollLeft,
    //        //    y = window.pageYOffset || document.documentElement.scrollTop,
    //        //    window.onscroll = function () {
    //        //        window.scrollTo(x, y);
    //        //    };
    //        // document.body.style.overflow = 'hidden'; // CSS
    //        disable_scroll_mobile();
    //    }
    //    // ENABLE SCROLL
    //    function enable_scroll() {
    //        if (document.removeEventListener) {
    //            document.removeEventListener('wheel', wheel, false);
    //            document.removeEventListener('mousewheel', wheel, false);
    //            document.removeEventListener('DOMMouseScroll', wheel, false);
    //        }
    //        document.onmousewheel = document.onmousewheel = document.onkeydown = null;
    //        window.onscroll = function () { };
    //        // document.body.style.overflow = 'auto'; // CSS
    //        enable_scroll_mobile();
    //    }

    //    // MOBILE
    //    function disable_scroll_mobile() {
    //        document.addEventListener('touchmove', preventDefault, false);
    //    }
    //    function enable_scroll_mobile() {
    //        document.removeEventListener('touchmove', preventDefault, false);
    //    }
    //},

}