
var g_ui = {
  "data": {},
  "ready": false,
  "two" : new Two({"fitted":true})
}

function _bbupdate(bb, xy, init) {
  init = ((typeof init === "undefined") ? false : init);

  if (init) {
    bb[0][0] = xy[0];
    bb[1][0] = xy[0];
    bb[0][1] = xy[1];
    bb[1][1] = xy[1];
  }

  bb[0][0] = Math.min( bb[0][0], xy[0] );
  bb[0][1] = Math.min( bb[0][1], xy[1] );

  bb[1][0] = Math.max( bb[1][0], xy[0] );
  bb[1][1] = Math.max( bb[1][1], xy[1] );

  return bb;
}

function draw_region(region_info, oxy, scale, disp_info) {
  if (!g_ui.ready) { return; }

  oxy = ( (typeof oxy === "undefined") ? [0,0] : oxy );
  scale = ( (typeof scale === "undefined") ? 1 : scale );
  disp_info = ( (typeof disp_info === "undefined") ? {"stroke":"rgb(100,100,100)", "fill":"rgb(200,200,200)" } : disp_info);

  let two = g_ui.two;

  let grid_ctx = g_ui.data;
  let region_id = region_info.region;
  let cut_segment = region_info.cut_segment;

  let dualCell = grid_ctx.dualCell;
  let dualG = grid_ctx.dualG;

  for (let region_idx=0; region_idx < region_id.length; region_idx++) {
    let id = region_id[region_idx];

    let cell = dualCell[id];

    let R = cell.R;

    let bb = [[0,0],[0,0]];

    let tR  = [];
    for (let i=0; i<R.length; i++) {
      tR.push([
        R[i][0]*scale + oxy[0],
        -R[i][1]*scale + oxy[1]
      ]);

      _bbupdate(bb, tR[i], (i==0));
    }

    let mp = [
      cell.midpoint[0]*scale + oxy[0],
      -cell.midpoint[1]*scale + oxy[1]
    ];

    let w = bb[1][0] - bb[0][0];
    let h = bb[1][1] - bb[0][1];

    let viz_rect = two.makeRectangle( mp[0], mp[1], w, h );
    //viz_rect.stroke = "rgb(100,100,100)";
    //viz_rect.fill = "rgb(200,200,200)";

    viz_rect.stroke = disp_info.stroke;
    viz_rect.fill = disp_info.fill;


    console.log(id, cell);
  }

  two.update();
}

function draw_regions() {
  if (!g_ui.ready) { return; }

  let two = g_ui.two;

  let grid_ctx = g_ui.data;
  let region_map = grid_ctx.region_map;
  let region_name = grid_ctx.region_name;

  let dualCell = grid_ctx.dualCell;

  let cxy = [  two.width/2, two.height/2 ];
  let r = Math.min( 1.5*two.width/4, 1.5*two.height/4 );
  let s = 5;

  let full_region_info = {
    "region": [],
    "region_key": "",
    "shape" : "Z",
    "cut_type": "x",
    "cut_segment": [],
    "cut_cost": 0,
    "child_key": [],
    "child_region": [],
    "cost": -1
  };

  let r_key = [];
  for (let i=0; i<dualCell.length; i++) {
    full_region_info.region.push(i);
    r_key.push( i.toString() );
  }
  full_region_info.region_key = r_key.join(",");

  let disp_info = {
    "stroke": "rgb(150,150,150)",
    "fill": "rgb(250,250,250)"
  };

  for (let idx=0; idx<region_name.length; idx++) {
    let name = region_name[idx];
    let region_info = region_map[name];

    let theta = 2 * Math.PI * (idx / region_name.length);

    let txy = [ cxy[0] + r*Math.cos(theta), cxy[1] + r*Math.sin(theta) ];

    draw_region( full_region_info, txy, s, disp_info );
    draw_region( region_info, txy, s );
  }

  for (let idx=0; idx<region_name.length; idx++) {
    let name = region_name[idx];
    let region_info = region_map[name];
    let theta = 2 * Math.PI * (idx / region_name.length);

    let child_pair = region_info.child_key;
    for (let cp_idx=0; cp_idx<child_pair.length; cp_idx++) {
      let dst_name = child_pair[cp_idx][0];
      if (!(dst_name in region_map)) {
        console.log("NOT FOUND:", dst_name, "from", name);
        continue;
      }
      let dst_region_info = region_map[dst_name];
    }

  }

}

// legacy
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

  getf("data/grid_ctx.json", function(d) { g_ui.data = d; g_ui.ready = true; draw_regions(); });
}
