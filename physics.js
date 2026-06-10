let objects = []

// some helper functions
function toRads(degrees) {
  return degrees * (Math.PI / 180);
}

function toDeg(rads) {
  return rads * 180 / Math.PI
}

// represents a force
class PhysicsForce {
  constructor(newtons, position, angle) {
    this.newtons = newtons
    this.position = position
    this.angle = angle
  }

  opposite() {
    // get the opposite of the force
    return new PhysicsForce(
      -this.newtons,
      this.position,
      (this.angle + 180) % 360
    )
  }

  x() {
    // extract x component
    return new PhysicsForce(
      this.newtons * Math.cos(toRads(this.angle)),
      this.position,
      0
    )
  }

  y() {
    // extract y component
    return new PhysicsForce(
      this.newtons * Math.sin(toRads(this.angle)),
      this.position,
      90
    )
  }

  add(force) {
    // add the forces together
    let rx = this.newtons * Math.cos(toRads(this.angle))
    rx += force.newtons * Math.cos(toRads(force.angle))
    let ry = this.newtons * Math.sin(toRads(this.angle))
    ry += force.newtons * Math.sin(toRads(force.angle))

    return new PhysicsForce(
      Math.sqrt(rx ** 2 + ry ** 2),
      this.position,
      toDeg(Math.atan2(ry, rx))
    )
  }

  static fromDirection(x1, y1, x2, y2, newtonsX, newtonsY) {
    // build from two objects and distance
    let force = new PhysicsForce(
      0,
      [x1, y1],
      toDeg(Math.atan2(y2 - y1, x2 - x1))
    )

    force.newtons = newtonsX ** 2 + newtonsY ** 2 - (2 * newtonsX * newtonsY * Math.cos(toRads(force.angle)));

    return force;
  }

  static fromComponents(x, y, position) {
    // from x and y component
    return new PhysicsForce(
      Math.sqrt(x ** 2 + y ** 2),
      position,
      toDeg(Math.atan2(y, x))
    )
  }

}

class PhysicsObject {
  constructor(
    position,
    velocity,
    acceleration,
    forces,
    mass,
    renderFunction, collisionFunction
  ) {
    this.renderFunction = renderFunction;
    this.collisionFunction = collisionFunction;

    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.forces = forces;
    this.mass = mass;
    this.collisions = [];

    objects.push(this);
  }

  updateVel(deltaTime) {
    let totalForce = new PhysicsForce(0, this.position, 0);

    this.forces["gravity"] = new PhysicsForce(9.8 * this.mass, this.position, 270);
    this.forces["right"] = new PhysicsForce(2 * this.mass, this.position, 0);
    Object.values(this.forces).forEach(force => {
      totalForce = totalForce.add(force);
    });


    // convert forces to acceleration (second law)
    this.acceleration = [totalForce.x().newtons / this.mass, totalForce.y().newtons / this.mass]
    this.velocity[0] += this.acceleration[0] * deltaTime;
    this.velocity[1] += this.acceleration[1] * deltaTime;
  }

  update(deltaTime) {
    if (this.mass == Math.max()) return this.renderFunction(this);

    // apply velocity and position. order matters here this caused me so much pain and agony
    console.log("dt", deltaTime, "delta p", this.velocity[0] * deltaTime, "p:", this.position[0])
    this.position[0] += this.velocity[0] * deltaTime;
    this.position[1] += this.velocity[1] * deltaTime;

    // avoid precision and rounding errors (usually functions like sin or cos will be a little off 0)
    if (Math.abs(this.velocity[0]) <= 0.01) this.velocity[0] = 0
    if (Math.abs(this.velocity[1]) <= 0.01) this.velocity[1] = 0
    if (Math.abs(this.acceleration[0]) <= 0.01) this.acceleration[0] = 0
    if (Math.abs(this.acceleration[1]) <= 0.01) this.acceleration[1] = 0
  }


}


function addSquare(x, y, width, height, velocity, acceleration, forces, mass, color, show=true) {
  // get the label of the box
  let index = "#" + (objects.length);


  return new PhysicsObject(
    [x, y], velocity, acceleration, forces, mass,
    function(object) {
      ctx.fillStyle = color;
      drawRect(object.position[0] - width / 2, object.position[1] + height / 2, width, height);

      // dont draw if ground
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      if (show) drawText(object.position[0], object.position[1], index)
    },
    function(object) {
      return {
        "left": object.position[0] - width / 2,
        "right": object.position[0] + width / 2,
        "top": object.position[1] + height / 2,
        "bottom": object.position[1] - height / 2
      }
    }
  )
}

let playing = false
let lastTime = performance.now();
const dt = 1 / 60;
let accumulator = 0;
let ctime = 0;
const e = 0.3;
let helpText = true;
let updateFunc = undefined;

setTimeout(() => helpText = false, 3000)

function update() {
  // get time since last update
  time = performance.now();
  let frameTime = (time - lastTime) / 1000;
  lastTime = time;

  if (playing) {
    // avoid moving too many frames at a time
    if (frameTime > 0.25) {
      frameTime = 0.25;
    }

    // catch up on missed frames
    accumulator += frameTime;

    while (accumulator >= dt) {
      ctime += dt;
      doPhysics(dt);
      if (updateFunc) updateFunc();
      accumulator -= dt;
    }
  }

  // render here so it renders even if paused
  clearScreen();
  objects.forEach(object => {
    object.renderFunction(object);
  });

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  drawText(window.innerWidth, 60, ctime.toFixed(2), true);
  if (helpText) drawText(30, 2, "Shift left click to move around");

  for (let i = 0; i < 10000; i += 250) {
    if (normalizePosition(i) > viewport[0] + window.innerWidth || normalizePosition(i) < viewport[0]) continue;
    drawText(i, 2, i + " m")
  }


  // timeout of 0 = run as soon as possible
  setTimeout(update, 0)
}

// basic collision detection
function checkBoxes(box1, box2, recurse=true) {
  let xcollide = (box1['left'] <= box2['right'] && box1['left'] >= box2['left'])
  xcollide = xcollide || (box1['right'] >= box2['left'] && box1['right'] <= box2['right'])
  let ycollide = (box1['bottom'] >= box2['bottom'] && box1['bottom'] <= box2['top'])
  ycollide = ycollide || (box1['top'] <= box2['top'] && box1['top'] >= box2['bottom'])
  
  // in the instance where one box is way larger, it will not handle collisions, so run with flipped arguments
  let [oxcollide, oycollide] = [false, false]
  if (recurse) [oxcollide, oycollide] = checkBoxes(box2, box1, false);

  return [xcollide || oxcollide, ycollide || oycollide]
}


function doPhysics(dt) {
  let collisionDetectors = new Map();

  // get bounding boxes and run updates
  objects.forEach(object => {
    let box = object.collisionFunction(object);
    object.updateVel(dt);
    
    collisionDetectors.set(object, object.collisionFunction(object));
  })

  const entries = Array.from(collisionDetectors.entries());

  // run the for loop like this so the pairs of boxes don't duplicate (a & b, b & a wont happen)
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [obj1, box1] = entries[i];
      const [obj2, box2] = entries[j];

      if (obj1.mass == Math.max() && obj2.mass == Math.max()) continue; // if both are static don't handle collision

      let [xcollide, ycollide] = checkBoxes(box1, box2);

      if (xcollide && ycollide) {
        let dx = obj2.position[0] - obj1.position[0];
        let dy = obj2.position[1] - obj1.position[1];

        let penX = (box1["right"] - obj1.position[0]) + (box2["right"] - obj2.position[0]) - Math.abs(dx);
        let penY = (box1["top"] - obj1.position[1]) + (box2["top"] - obj2.position[1]) - Math.abs(dy);

        let normal = [0, 0]

        // find normal force (for collision)

        if (penX < penY) {
          normal[0] = dx > 0 ? 1 : -1;
        } else {
          normal[1] = dy > 0 ? 1 : -1;
        }

        if (obj1.mass == Math.max() || obj2.mass == Math.max()) {
          // find which one is hte box, which is the wall
          let obj = obj1;
          if (obj1.mass == Math.max()) obj = obj2;


          let velocityAlongNormal = obj.velocity[0] * normal[0] + obj.velocity[1] * normal[1];
          if (velocityAlongNormal > 1) continue;

          let j = -(1 + e) * velocityAlongNormal;
          let impulse = [j * normal[0], j * normal[1]];

          obj.velocity = [
            obj.velocity[0] + impulse[0],
            obj.velocity[1] + impulse[1]
          ]
        } else {
          let relVel = [obj1.velocity[0] - obj2.velocity[0], obj1.velocity[1] - obj2.velocity[1]];
          let velocityAlongNormal = relVel[0] * normal[0] + relVel[1] * normal[1];

          let j = -(1 + e) * velocityAlongNormal;
          j /= (1 / obj1.mass + 1 / obj2.mass);
          let impulse = [j * normal[0], j * normal[1]];

          obj1.velocity = [
            obj1.velocity[0] + (impulse[0] * (1 / obj1.mass)),
            obj1.velocity[1] + (impulse[1] * (1 / obj1.mass))
          ]

          obj2.velocity = [
            obj2.velocity[0] - (impulse[0] * (1 / obj2.mass)),
            obj2.velocity[1] - (impulse[1] * (1 / obj2.mass))
          ]
        }
      }
    }
  }

  objects.forEach(object => {
    object.update(dt);
  })
}

update();

