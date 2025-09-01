
var g_ui = {
  "data": {},
  "ready": false,
  "two" : new Two({"fitted":true})
}

function draw_region(region_info) {
}

function draw() {
  let two = g_ui.two;
  let data = g_ui.data;

  if (!g_ui.ready) { return; }

  let o_xy = [ 20, 50 ];
  let scale = 15;

  for (let j=0; j<data.dualG.length; j++) {
    for (let i=0; i<data.dualG[j].length; i++) {
      let p = data.dualG[j][i];
      if (p.id < 0) { continue; }

      console.log(">>", p.id, p.R, p);

      let wh = [
        scale*(p.R[1][0] - p.R[0][0]),
        scale*(p.R[3][1] - p.R[0][1])
      ];

      let axy = [
        scale*p.midpoint[0] + o_xy[0],
        scale*p.midpoint[1] + o_xy[1]
      ];

      console.log(axy, wh);

      let rect = two.makeRectangle( axy[0], axy[1], wh[0], wh[1] );

    }

  }

  two.update();
}

function init_two() {
  let two = g_ui.two;

  let ele = document.getElementById("ui_canvas");
  two.appendTo(ele);

  two.clear();
}

function getf(url, cb) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if ((xhr.readyState === 4) && (xhr.status === 200)) {
      let json_data = JSON.parse(xhr.responseText);
      if (!(typeof cb === "undefined")) { cb(json_data); }
    }
    else if ((xhr.readyState === 4) && (!(xhr.status === 200))) {
      console.log("ERROR", url, xhr.statusText, xhr.readyState, xhr.status);
    }
  }
  xhr.open("GET", url, true);
  xhr.send();
}

function webinit() {
  console.log("...");

  init_two();

  getf("data/grid_ctx.json", function(d) { g_ui.data = d; g_ui.ready = true; draw(); });
}
