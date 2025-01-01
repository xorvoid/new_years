var canvas_width = 700;
var canvas_height = 700;
var background_color = 'black';
var fireworks = [];
var ctx = null;
const fps = 60;
const max_step = 100;
const fade_start = 75;
const fade_end = 120;
const remove_step = 120;
const new_fireworks_per_second = 3.5;
const colors = ['red', 'blue', 'silver', 'green', 'gold'];

const DEBUG = 0;
var DEBUG_COLORS = ['green', 'red', 'orange', 'cyan', 'yellow', 'blue'];

function run() {
    ctx = document.getElementById('scene').getContext('2d');
    render_frame();
}

function render_frame() {
    window.setTimeout(render_frame, 1000 / fps);
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    ctx.fillStyle = background_color;
    ctx.fillRect(0, 0, canvas_width, canvas_height);
    update();
    draw_scene();
}

class Spark {
    constructor(pos, vel, color) {
        this.start = [pos[0], pos[1]];
        this.pos = pos
        this.vel = vel
        this.step = 0
        this.color = color;
        
    }

    update() {
        for (var k = 0; k < 3; k++) {
            this.step += 1;
            if (this.step >= max_step) {
                return;
            }
        
            this.pos[0] += this.vel[0]/fps;
            this.pos[1] += this.vel[1]/fps;
        }
    }

    draw() {
        var start = this.start;
        var end = this.pos;

        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);

        var k = (this.step - fade_start) / (fade_end - fade_start);
        k = clamp(k, 0, 1);
        ctx.globalAlpha = 1.0 - k;

        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
}

class Firework {
    constructor(pos, color) {
        this.pos = pos;
        this.sparks = [];
        var n = 50;
        var min_speeds = [40, 75];
        var max_speeds = [80, 100];
        for (var j = 0; j < 2; j++) {
            for (var i = 0; i < n; i++) {
                var speed = random_range(min_speeds[j], max_speeds[j]);
                var theta = 2 * Math.PI * i / n;
                var c = Math.cos(theta)
                var s = Math.sin(theta);
                this.sparks.push(
                    new Spark([0.0, 0.0], [speed*c, speed*s], color)
                );
            }
        }
    }

    update() {
        for (const s of this.sparks) {
            s.update();
        }
    }
    
    draw() {
        draw_context(() => {
            translate(this.pos[0], this.pos[1]);
            for (const s of this.sparks) {
                s.draw();
            }
        });
    }
}

function update() {
    // Update the step/evolution of current fireworks
    for (const f of this.fireworks) {
        f.update();
    }

    // Remove old fireworks
    var new_fireworks = [];
    for (const f of this.fireworks) {
        if (f.sparks[0].step < remove_step) {
            new_fireworks.push(f);
        }
    }
    this.fireworks = new_fireworks;
        
    // Create new fireworks
    var k = new_fireworks_per_second / fps;
    if (random_range(0, 1) < k) {
        var x = random_range(-canvas_width/2, canvas_width/2);
        var y = random_range(-canvas_height/2, canvas_height/2);
        var color = random_element(colors);
        this.fireworks.push(new Firework([x, y], color));
    }
}

function clamp(x, a, b) {
    return Math.max(Math.min(x, b), a);
}

function draw_context(func) {
    let loc = ctx.save();
    func();
    ctx.restore(loc);
}

function rotate(deg) {
    var t = deg*Math.PI/180
    ctx.rotate(t)
}

function translate(x, y) {
    ctx.translate(x, y);
}

function scale(x, y) {
    ctx.scale(x, y)
}

function square(color) {
    ctx.fillStyle = color;
    ctx.fillRect(-0.5, -0.5, 1, 1);
}

function circle(color, radius=1.0) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.arc(0, 0, radius, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
}

function triangle(color, scale) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.moveTo(-0.5*scale, 0.0);
    ctx.lineTo(0.5*scale, 0.0);
    ctx.lineTo(0.0, Math.sqrt(3)/2*scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();    
}

function star(color, scale) {
    function triangle_point() {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.moveTo(-1.0*scale, 0.0);
        ctx.lineTo(1.0*scale, 0.0);
        ctx.lineTo(0.0, scale*3.0776835371752536);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    rotate(72);
    triangle_point();
    rotate(72);
    triangle_point();
    rotate(72);
    triangle_point();
    rotate(72);
    triangle_point();
    rotate(72);
    triangle_point();
}

function draw_axes() {
    var loc = ctx.save();
    scale(canvas_width, 1)
    square('red')
    ctx.restore(loc)

    var loc = ctx.save();
    rotate(90)
    scale(canvas_height, 1)
    square('green')
    ctx.restore(loc)
}

function deg_to_rad(deg) {
    return deg / 180.0 * Math.PI;
}

function random_range(a, b) {
    return Math.random() * (b-a) + a;
}

function random_element(arr) {
    var idx = Math.floor(random_range(0, arr.length));
    return arr[idx];
}

function draw_scene() {
    draw_context(() => {
        translate(canvas_width/2, canvas_height/2)
        scale(1, -1);
        
        if (DEBUG) {
            draw_axes();
        }

        for (const f of this.fireworks) {
            f.draw();
        }
    })

    ctx.font = "78px Snell Roundhand";
    ctx.strokeStyle = '#baedf8';
    ctx.strokeText("Happy New Year!", 75, canvas_height/2);
}

