var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _this = this;
var Color = /** @class */ (function () {
    function Color(r, g, b, a) {
        if (a === void 0) { a = 1; }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    Color.prototype.setAlpha = function (a) {
        return new Color(this.r, this.g, this.b, a);
    };
    Color.prototype.toString = function () {
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    };
    return Color;
}());
var Rand = /** @class */ (function () {
    function Rand() {
    }
    Rand.getRandomInt = function (start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = 100; }
        return Math.round(Math.random() * (end - start) + start);
    };
    Rand.getRandomColor = function (start, end) {
        if (start === void 0) { start = 60; }
        if (end === void 0) { end = 255; }
        return new Color(this.getRandomInt(start, end), this.getRandomInt(start, end), this.getRandomInt(start, end));
    };
    Rand.getRandomString = function (length) {
        if (length === void 0) { length = 10; }
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    return Rand;
}());
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.add = function (p) {
        return new Point(this.x + p.x, this.y + p.y);
    };
    Point.prototype.multiply = function (n) {
        return new Point(this.x * n, this.y * n);
    };
    Point.prototype.multiplyEach = function (p) {
        return new Point(this.x * p.x, this.y * p.y);
    };
    Point.prototype.scalar = function (p) {
        return this.x * p.x + this.y * p.y;
    };
    Point.prototype.projection = function (p) {
        return this.scalar(p) / p.length();
    };
    Point.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Point.prototype.round = function (n) {
        return new Point(+this.x.toFixed(n), +this.y.toFixed(n));
    };
    Point.prototype.contains = function (p) {
        return p.x <= this.x && p.y <= this.y && p.x >= 0 && p.y >= 0;
    };
    Point.getDistance = function (x, y) {
        return Math.sqrt(Math.pow(x.x - y.x, 2) + Math.pow(x.y - y.y, 2));
    };
    return Point;
}());
var WorldObject = /** @class */ (function () {
    function WorldObject(size, position, speed) {
        if (speed === void 0) { speed = new Point(0, 0); }
        this.size = size;
        this.position = position;
        this.speed = speed;
        this.hover = false;
        this.collision = false;
        this.drag = false;
        this.priority = 10;
        this.density = 1;
        this.dragPoint = new Point(0, 0);
        this.id = Rand.getRandomString(10);
    }
    WorldObject.prototype.init = function (world) {
    };
    WorldObject.prototype.render = function (ctx) {
    };
    WorldObject.prototype.tick = function (world) {
        this.processCollisions(world);
        this.speed = this.speed.round(1);
        this.position = this.position.round(1);
        if (this.position.x >= world.size.x - this.size.x && this.speed.x > 0)
            this.speed.x = -Math.abs(this.speed.x) * this.elasticity;
        if (this.position.y >= world.size.y - this.size.y && this.speed.y > 0)
            this.speed.y = -Math.abs(this.speed.y) * this.elasticity;
        if (this.position.x <= 0 && this.speed.x < 0)
            this.speed.x = Math.abs(this.speed.x) * this.elasticity;
        if (this.position.y <= 0 && this.speed.y < 0)
            this.speed.y = Math.abs(this.speed.y) * this.elasticity;
        if (world.size.contains(this.position.add(this.size)))
            this.speed = this.speed.add(world.gravity);
        this.position = this.position.add(this.speed);
        this.resetCross();
    };
    WorldObject.prototype.resetCross = function () {
        var crossX = this.position.x - world.size.x - this.size.x;
        if (crossX > 0)
            this.position.x -= crossX;
        if (this.position.x < 0)
            this.position.x = 0;
        var crossY = this.position.y - world.size.y - this.size.y;
        if (crossY > 0)
            this.position.y -= crossY;
        if (this.position.y < 0)
            this.position.y = 0;
    };
    WorldObject.prototype.processCollisions = function (world) {
    };
    WorldObject.prototype.remove = function () {
        this.removed = true;
    };
    WorldObject.prototype.dragStart = function (p, pointer) {
        if (this.drag)
            return;
        this.drag = true;
        this.dragPoint = p.add(this.position.multiply(-1));
    };
    WorldObject.prototype.dragMove = function (p, pointer) {
        if (!this.drag)
            return;
        this.position = p.add(this.dragPoint.multiply(-1));
    };
    WorldObject.prototype.dragEnd = function (p, pointer) {
        if (!this.drag)
            return;
        this.drag = false;
        this.speed = pointer.speed.multiply(1 / this.world.getFPS());
    };
    WorldObject.prototype.contains = function (p) {
        if (Array.isArray(p))
            return this.containsPoints(p);
        return this.containsPoint(p);
    };
    WorldObject.prototype.getCenterPoint = function () {
        return this.position.add(this.size.multiply(1 / 2));
    };
    WorldObject.prototype.getWeight = function () {
        return this.density * this.size.x * this.size.y;
    };
    WorldObject.prototype.containsPoint = function (p) {
        return this.size.contains(p.add(this.position.multiply(-1)));
    };
    WorldObject.prototype.containsPoints = function (points) {
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            if (this.containsPoint(p))
                return true;
        }
        return false;
    };
    return WorldObject;
}());
var Ball = /** @class */ (function (_super) {
    __extends(Ball, _super);
    function Ball() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.color = Rand.getRandomColor();
        return _this;
    }
    Ball.prototype.init = function (world) {
        this.elasticity = 0.95;
    };
    Ball.prototype.render = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, this.size.x / 2, 2 * Math.PI, false);
        ctx.fillStyle = this.getColor().toString();
        ctx.fill();
    };
    Ball.prototype.getRadius = function () {
        return this.size.x / 2;
    };
    Ball.prototype.getWeight = function () {
        return this.density * this.getRadius() * this.getRadius() * Math.PI;
    };
    Ball.prototype.containsPoint = function (p) {
        var center = this.position.add(this.size.multiply(0.5));
        return center.add(p.multiply(-1)).length() <= this.size.x / 2;
    };
    Ball.prototype.getColor = function () {
        if (this.drag)
            return this.color.setAlpha(0.6);
        if (this.hover)
            return this.color.setAlpha(0.8);
        if (this.collision)
            return new Color(255, 0, 0, 0.5);
        return this.color;
    };
    Ball.prototype.processCollisions = function (world) {
        for (var _i = 0, _a = world.objects; _i < _a.length; _i++) {
            var object = _a[_i];
            if (object.id == this.id)
                continue;
            if (object.drag)
                continue;
            if (object instanceof Ball) {
                if (this.getCenterPoint().add(object.getCenterPoint().multiply(-1)).length() <= this.getRadius() + object.getRadius()) {
                    var m1 = this.getWeight(), m2 = object.getWeight();
                    var v1 = this.speed.projection(this.getCenterPoint().add(object.getCenterPoint().multiply(-1))), v2 = object.speed.projection(this.getCenterPoint().add(object.getCenterPoint().multiply(-1)));
                    var newV1 = (2 * m2 * v2 + (m1 - m2) * v1) / (m1 + m2);
                    var newV2 = (2 * m1 * v1 + (m2 - m1) * v2) / (m1 + m2);
                    var norm = this.getCenterPoint().add(object.getCenterPoint().multiply(-1));
                    norm = norm.multiply(1 / norm.length());
                    var cross = norm.multiply(Math.abs(this.getRadius() + object.getRadius() - this.getCenterPoint().add(object.getCenterPoint().multiply(-1)).length()));
                    this.speed = this.speed.add(norm.multiply(-v1 + newV1)).multiply(this.elasticity);
                    object.speed = object.speed.add(norm.multiply(-v2 + newV2)).multiply(this.elasticity);
                    this.position = this.position.add(cross.multiply(1 / 2));
                    object.position = object.position.add(cross.multiply(-1 / 2));
                    this.resetCross();
                    object.resetCross();
                }
            }
        }
    };
    Ball.createRandom = function (worldSize, radius, speed) {
        if (radius === void 0) { radius = Rand.getRandomInt(5, 20); }
        if (speed === void 0) { speed = Math.random() * 40 - 20; }
        var size = new Point(radius * 2, radius * 2);
        var position = worldSize.add(size.multiply(-1)).multiplyEach(new Point(Math.random(), Math.random()));
        return new Ball(size, position, new Point(speed * Math.random(), speed * Math.random()));
    };
    return Ball;
}(WorldObject));
var Pointer = /** @class */ (function () {
    function Pointer(x, y, pressed) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (pressed === void 0) { pressed = false; }
        this.speed = 0;
        this.timestamp = Date.now();
        this.pressed = false;
        this.position = new Point(x, y);
        this.pressed = pressed;
        this.timestamp = Date.now();
    }
    Pointer.prototype.update = function (x, y, pressed, event) {
        if (pressed === void 0) { pressed = undefined; }
        if (event === void 0) { event = undefined; }
        var newPosition = new Point(x, y);
        var newTimestamp = Date.now();
        if (event.type.indexOf('env') < 0)
            this.speed = newPosition.add(this.position.multiply(-1)).multiply(1 / (newTimestamp - this.timestamp) * 1000);
        this.speed.x = Math.min(this.speed.x, 1);
        this.speed.y = Math.min(this.speed.y, 1);
        this.timestamp = newTimestamp;
        this.position = newPosition;
        if (pressed !== undefined)
            this.pressed = pressed;
    };
    return Pointer;
}());
var GravitySlider = /** @class */ (function (_super) {
    __extends(GravitySlider, _super);
    function GravitySlider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.priority = -1;
        return _this;
    }
    GravitySlider.prototype.init = function (world) {
        this.position = new Point(20, 20);
    };
    GravitySlider.prototype.tick = function (world) {
        // let center = this.position.add(this.size.multiply(1/2));
    };
    GravitySlider.prototype.dragMove = function (p, pointer) {
        if (!this.drag)
            return;
        this.dragPoint = p.add(this.position.multiply(-1));
        if (this.dragPoint.x >= this.size.x)
            this.dragPoint.x = this.size.x;
        if (this.dragPoint.y >= this.size.y)
            this.dragPoint.y = this.size.y;
        if (this.dragPoint.y <= 0)
            this.dragPoint.y = 0;
        if (this.dragPoint.x <= 0)
            this.dragPoint.x = 0;
        this.world.gravity = this.dragPoint.add(this.size.multiply(-1 / 2)).multiply(1 / 50);
    };
    GravitySlider.prototype.render = function (ctx) {
        var handlePosition = this.position;
        if (handlePosition.x >= this.size.x)
            handlePosition.x = this.size.x;
        if (handlePosition.y >= this.size.y)
            handlePosition.y = this.size.y;
        if (handlePosition.y <= 0)
            handlePosition.y = 0;
        if (handlePosition.x <= 0)
            handlePosition.x = 0;
        handlePosition = handlePosition.add(this.size.multiply(1 / 2)).add(this.world.gravity.multiply(50));
        ctx.fillStyle = ctx.strokeStyle = this.hover ? "blue" : "red";
        ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);
        ctx.beginPath();
        ctx.arc(handlePosition.x, handlePosition.y, 10, 2 * Math.PI, false);
        ctx.fill();
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.world.gravity.x.toFixed(2) + ", " + this.world.gravity.y.toFixed(2), this.position.x, this.position.add(this.size).y + 15);
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(world.getFPS() + " FPS", this.position.add(this.size).x, this.position.add(this.size).y + 15);
    };
    return GravitySlider;
}(WorldObject));
var World = /** @class */ (function () {
    function World(element) {
        this.element = element;
        this.pointer = new Pointer();
        this.motionSensor = true;
        this.ticks = 0;
        this.ticksInterval = 1000;
        this.fps = 0;
        this.objectsToAdd = [];
        this.objects = [];
        this.gravity = new Point(0, 0);
        this.init();
    }
    World.prototype.init = function () {
        var _this = this;
        this.resize();
        this.tick();
        setInterval(function () {
            _this.fps = _this.ticks;
            _this.ticks = 0;
        }, this.ticksInterval);
    };
    World.prototype.resize = function () {
        this.size = new Point(window.innerWidth, window.innerHeight);
        this.element.width = this.size.x;
        this.element.height = this.size.y;
        this.ctx = this.element.getContext("2d");
    };
    World.prototype.addObject = function (object) {
        this.objectsToAdd.push(object);
        object.world = this;
        object.init(this);
    };
    World.prototype.getFPS = function () {
        return this.fps;
    };
    World.prototype.resetGravity = function () {
        this.gravity = new Point(0, 0);
    };
    World.prototype.tick = function () {
        var _this = this;
        this.ticks++;
        this.clear();
        this.objects = this.objects.concat(this.objectsToAdd);
        this.objectsToAdd = [];
        this.sortObjects();
        var hoverObject = null;
        var dragObject = null;
        for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
            var object = _a[_i];
            object.hover = false;
            if (object.contains(this.pointer.position))
                hoverObject = object;
            if (object.drag)
                dragObject = object;
        }
        if (hoverObject)
            hoverObject.hover = true;
        if (dragObject) {
            dragObject.dragMove(this.pointer.position, this.pointer);
            if (!this.pointer.pressed) {
                dragObject.dragEnd(this.pointer.position, this.pointer);
                dragObject.hover = false;
            }
            else
                dragObject.hover = true;
        }
        if (this.pointer.pressed && hoverObject && !dragObject)
            hoverObject.dragStart(this.pointer.position, this.pointer);
        this.objects = this.objects.filter(function (object) {
            if (!object.drag)
                object.tick(_this);
            return !object.removed;
        });
        for (var _b = 0, _c = this.objects; _b < _c.length; _b++) {
            var object = _c[_b];
            object.render(this.ctx);
        }
        requestAnimationFrame(function () { return _this.tick(); });
    };
    World.prototype.getPriorities = function () {
        var result = [];
        for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
            var object = _a[_i];
            if (result.indexOf(object.priority) < 0)
                result.push(object.priority);
        }
        return result.sort();
    };
    World.prototype.sortObjects = function () {
        var result = [];
        var _loop_1 = function (priority) {
            for (var _i = 0, _a = this_1.objects.find(function (x) { return x.priority == priority; }); _i < _a.length; _i++) {
                var object = _a[_i];
                result.push(object);
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.getPriorities(); _i < _a.length; _i++) {
            var priority = _a[_i];
            _loop_1(priority);
        }
        if (result.length > 0)
            this.objects = result;
    };
    World.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
    };
    return World;
}());
var world = new World(document.getElementById("canvas"));
for (var i = 0; i < 200; i++) {
    world.addObject(Ball.createRandom(world.size, Rand.getRandomInt(5, 20)));
}
for (var i = 0; i < 10; i++) {
    world.addObject(Ball.createRandom(world.size, Rand.getRandomInt(20, 60)));
}
world.addObject(new GravitySlider(new Point(100, 100), new Point(50, 50)));
document.getElementById("motionSensor").addEventListener("click", function () {
    world.motionSensor = _this.checked;
});
document.getElementById("resetGravity").addEventListener("click", function () {
    world.resetGravity();
});
window.addEventListener("resize", function () {
    world.resize();
});
window.addEventListener("mousemove", function (event) {
    world.pointer.update(event.pageX, event.pageY, undefined, event);
    event.preventDefault();
});
window.addEventListener("mousedown", function (event) {
    world.pointer.update(event.pageX, event.pageY, true, event);
    event.preventDefault();
});
window.addEventListener("mouseup", function (event) {
    world.pointer.update(event.pageX, event.pageY, false, event);
    event.preventDefault();
});
window.addEventListener("touchmove", function (event) {
    world.pointer.update(event.changedTouches[0].pageX, event.changedTouches[0].pageY, undefined, event);
    event.preventDefault();
});
window.addEventListener("touchstart", function (event) {
    world.pointer.update(event.changedTouches[0].pageX, event.changedTouches[0].pageY, true, event);
    event.preventDefault();
});
window.addEventListener("touchend", function (event) {
    world.pointer.update(event.changedTouches[0].pageX, event.changedTouches[0].pageY, false, event);
    event.preventDefault();
});
window.addEventListener("devicemotion", function (event) {
    if (world.motionSensor)
        world.gravity = new Point(event.accelerationIncludingGravity.x / 10, -event.accelerationIncludingGravity.y / 10);
});
