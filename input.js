let controller = document.querySelector("#controller");
let items = [];

controller.addEventListener("click", () => {
  playing = !playing;
  controller.innerText = playing ? "Pause" : "Play"

  document.querySelector("#add").style.opacity = playing ? 0 : 100;
});

updateFunc = () => {
  items.forEach(([item, object]) => {
    object = item.object;
    item.querySelector("#xx").value = (object.position[0] - item.size[0] / 2).toFixed(2);
    item.querySelector("#xy").value = (object.position[1] - item.size[1] / 2).toFixed(2);
    item.querySelector("#vx").value = (object.velocity[0]).toFixed(2);
    item.querySelector("#vy").value = (object.velocity[1]).toFixed(2);
    item.querySelector("#ax").value = (object.acceleration[0]).toFixed(2);
    item.querySelector("#ay").value = (object.acceleration[1]).toFixed(2);
  })
}


addSquare(window.innerWidth / 3, -25, 10000, 50, [0, 0], [0, 0], {}, Math.max(), "green", false)

let colors = [
  "red", "orange", "yellow", "green", "blue", "pink", "purple", "brown", "white"
]

let panelList = document.querySelector("#list")


function createInput(parent, value, callback, id) {
  let input = document.createElement("input");
  parent.appendChild(input);

  input.value = value;
  input.placeholder = 0;
  input.id = id;

  input.addEventListener("change", (event) => callback(event.target.value));
}

function addText(parent, text) {
  parent.appendChild(document.createElement("br"));

  let elm = document.createElement("b");
  elm.innerText = text + "  ";
  elm.style.marginLeft = "5px";

  parent.appendChild(elm)
}

document.querySelector("#make").addEventListener("click", (e) => {
  let pos = [parseInt(document.querySelector("#nposx").value || 0, 10), parseInt(document.querySelector("#nposy").value || 0, 10)];
  let vel = [parseInt(document.querySelector("#nvelx").value || 0, 10), parseInt(document.querySelector("#nvely").value || 0, 10)];
  let ace = [parseInt(document.querySelector("#nacex").value || 0, 10), parseInt(document.querySelector("#nacey").value || 0, 10)];
  let size = [parseInt(document.querySelector("#width").value || 10, 10), parseInt(document.querySelector("#height").value || 10, 10)];
  let mass = parseInt(document.querySelector("#mass").value || 10, 10);

  let object = addSquare(pos[0] + size[0] / 2, pos[1] + size[1] / 2, size[0], size[1], vel, ace, {}, mass, colors[(objects.length - 1) % colors.length])

  
  let item = document.createElement("li");
  item.id = "item";
  item.innerText = "#" + (objects.length - 1) + " "
  item.object = object;
  item.size = size;

  addText(item, "x")
  createInput(item, pos[0], v => {
    object.position[0] = parseInt(v || 0, 10) + size[0] / 2
  }, "xx");
  createInput(item, pos[1], v => {
    object.position[1] = parseInt(v || 0, 10) + size[1] / 2
  }, "xy");


  addText(item, "v")
  createInput(item, vel[0], v => object.velocity[0] = parseInt(v || 0, 10), "vx");
  createInput(item, vel[1], v => object.velocity[1] = parseInt(v || 0, 10), "vy");
 
  addText(item, "a")
  createInput(item, ace[0], v => object.acceleration[0] = parseInt(v || 0, 10), "ax");
  createInput(item, ace[1], v => object.acceleration[1] = parseInt(v || 0, 10), "ay");


  panelList.appendChild(item);
  items.push([item, object]);
});
