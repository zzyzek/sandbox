// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//     
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var SOKOITA_CHECK_CONSISTENCY_VERSION = "0.1.0";

var DEBUG_LEVEL = 0;

var fs = require("fs");
var getopt = require("posix-getopt");


function convert_exsb(poms, exsb) {

  let exsb_lines = exsb.split("\n");

  let level = [];

  let W = 0;
  let H = 0;
  let D = 0;

  let new_level = 1;
  let first_level = 1;

  let cur_level = [];

  for (let line_no=0; line_no<exsb_lines.length; line_no++) {
    if (exsb_lines[line_no].length == 0) {
      if (new_level) { D++; }
      new_level = 0;
      first_level = 0;

      if (cur_level.length > 0) {
        level.push(cur_level);
        cur_level = [];
      }

      continue;
    }

    new_level = 1;

    if (first_level) {
      H++;
    }

    cur_level.push( exsb_lines[line_no].split("") );
  }

  if (cur_level.length > 0) {
    level.push(cur_level);
    cur_level = [];
  }

  W = level[0][0].length;

  let pad_level = [ ];
  for (let z=0; z<D; z++) {
    pad_level.push( [] );
    for (let y=0; y<(H+2); y++) {
      pad_level[z].push([]);
      for (let x=0; x<(W+2); x++) {
        pad_level[z][y].push("'");
      }
    }
  }

  for (let z=0; z<D; z++) {
    for (let x=0; x<(W+2); x++) { pad_level[z][0][x] = '#';  }
    for (let y=1; y<(H+1); y++) {
      pad_level[z][y][0] = '#';
      for (let x=1; x<(W+1); x++) {
        pad_level[z][y][x] = level[z][y-1][x-1];
      }
      pad_level[z][y][W+1] = '#';
    }
    for (let x=0; x<(W+2); x++) { pad_level[z][H+1][x] = '#'; }
  }

  if (DEBUG_LEVEL > 2) {
    console.log("-----\npadded xsb:");
    for (let z=0; z<pad_level.length; z++) {
      for (let y=0; y<pad_level[0].length; y++) {
        console.log( pad_level[z][y].join("") );
      }
      console.log("-----");
    }
    console.log("===\n");
  }

  // construct level with name lookup at each entry
  //
  let level_name = [];
  for (let z=0; z<D; z++) {
    level_name.push([]);
    for (let y=0; y<H; y++) {
      level_name[z].push([]);
      for (let x=0; x<W; x++) {

        let pz = z;
        let px = x+1;
        let py = y+1;

        let name =
                                      pad_level[pz][py-1][px+0] +
          pad_level[pz][py+0][px-1] + pad_level[pz][py+0][px+0] + pad_level[pz][py+0][px+1] +
                                      pad_level[pz][py+1][px+0];
        level_name[z][y].push(name);
      }
    }
  }

  // create name to tile id mapping
  //
  let name_id = {};
  for (let tile_id=0; tile_id<poms.name.length; tile_id++) {
    name_id[ poms.name[tile_id] ] = tile_id;
  }

  // create tile id level
  //
  let tile_level = [];
  for (let z=0; z<D; z++) {
    tile_level.push([]);
    for (let y=0; y<H; y++) {
      tile_level[z].push([]);
      for (let x=0; x<W; x++) {

        if (!(level_name[z][y][x] in name_id)) {

          console.log("ERROR: @[", x,y,z, "], could not find name:", level_name[z][y][x]);
          console.log("'" + level_name[z][y][x][0] + "'");
          console.log(level_name[z][y][x][1] +level_name[z][y][x][2] +level_name[z][y][x][3]);
          console.log("'" + level_name[z][y][x][4] + "'");

          return null;
        }

        tile_level[z][y].push( name_id[level_name[z][y][x]] );
      }
    }
  }

  return tile_level;
}


function convert_xsb(poms, xsb) {

  let xsb_lines = xsb.split("\n");

  let level = [];

  let W = 0;
  let H = 0;

  for (let line_no=0; line_no<xsb_lines.length; line_no++) {
    if (xsb_lines[line_no].length == 0) { continue; }
    H++;

    level.push( xsb_lines[line_no].split("") );
  }
  W = level[0].length;


  let pad_level = [ [] ];
  for (let x=0; x<(W+2); x++) { pad_level[0].push('#'); }
  for (let y=1; y<(H+1); y++) {
    pad_level.push( [ '#' ] );
    for (let x=1; x<(W+1); x++) {
      pad_level[y].push( level[y-1][x-1] );
    }
    pad_level[y].push('#');
  }
  let y = pad_level.length;
  pad_level.push( [] );
  for (let x=0; x<(W+2); x++) { pad_level[y].push('#'); }

  if (DEBUG_LEVEL > 2) {
    console.log("-----\npadded xsb:");
    for (let y=0; y<pad_level.length; y++) {
      console.log( pad_level[y].join("") );
    }
    console.log("-----\n");
  }

  // construct level with name lookup at each entry
  //
  let level_name = [];
  for (let y=0; y<H; y++) {
    level_name.push([]);
    for (let x=0; x<W; x++) {

      let px = x+1;
      let py = y+1;

      let name =
                                pad_level[py-1][px+0] +
        pad_level[py+0][px-1] + pad_level[py+0][px+0] + pad_level[py+0][px+1] +
                                pad_level[py+1][px+0];
      level_name[y].push(name);
    }
  }

  // create name to tile id mapping
  //
  let name_id = {};
  for (let tile_id=0; tile_id<poms.name.length; tile_id++) {
    name_id[ poms.name[tile_id] ] = tile_id;
  }

  // create tile id level
  //
  let tile_level = [];
  for (let y=0; y<H; y++) {
    tile_level.push([]);
    for (let x=0; x<W; x++) {

      if (!(level_nameg[y][x] in name_id)) {

        console.log("ERROR: @[", x,y, "], could not find name:", level_nameg[y][x]);
        console.log("'" + level_nameg[y][x][0] + "'");
        console.log(level_nameg[y][x][1] +level_nameg[y][x][2] +level_nameg[y][x][3]);
        console.log("'" + level_nameg[y][x][4] + "'");

        return null;
      }

      tile_level[y].push( name_id[level_name[y][x]] );
    }
  }

  return tile_level;
}

function xyz2cell(x,y,z,W,H,D) {
  if ((x<0) || (y<0) || (z<0) ||
      (x>=W) || (y>=H) || (z>=D)) { return -1; }
  let cell = (z*W*H) + (y*W) + x;
  return cell;
}

function consistency_check_map(poms, tile_level) {
  let W = tile_level[0].length;
  let H = tile_level.length;

  let dxyz = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1]
  ];

  let rule_map = {};
  for (let rule_idx=0; rule_idx<poms.rule.length; rule_idx++) {
    let rule = poms.rule[rule_idx];
    let key = rule[0].toString() + ":" + rule[1].toString() + ":" + rule[2].toString();
    rule_map[key] = 1;
  }

  let z = 0;
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {

      let src_tile = tile_level[y][x];

      for (let idir=0; idir<6; idir++) {

        let nei_xyz = [ x+dxyz[idir][0], y+dxyz[idir][1], z+dxyz[idir][2] ];

        let nei_tile = 0;
        let cell = xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, 1);

        if (DEBUG_LEVEL > 1) {
          console.log(x,y,z, "-->", nei_xyz[0], nei_xyz[1], nei_xyz[2], xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, 1));
        }

        if (cell >= 0) {
          nei_tile = tile_level[ nei_xyz[1] ][ nei_xyz[0] ];
        }

        if (DEBUG_LEVEL > 1) {
          let key = src_tile.toString() + ":" + nei_tile.toString() + ":" + idir.toString();
          console.log("  ", src_tile, "[", poms.name[src_tile], "]", "-(", idir, ")->", nei_tile, "[", poms.name[nei_tile], "]", ":", rule_map[key]);
        }

      }

    }
  }
}

function consistency_check_sol(poms, tile_level) {
  let W = tile_level[0][0].length;
  let H = tile_level[0].length;
  let D = tile_level.length;

  let dxyz = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1]
  ];

  let idir_descr = [ "+x", "-x", "+y", "-y", "+z", "-z" ];

  let name_map = {};
  for (let tile_id=0; tile_id<poms.name; tile_id++) {
    name_map[ poms.name[tile_id] ] = tile_id;
  }

  let valid = 1;

  let z = 0;
  for (let z=0; z<D; z++) {
    for (let y=0; y<H; y++) {
      for (let x=0; x<W; x++) {

        let src_tile = tile_level[z][y][x];

        for (let idir=0; idir<6; idir++) {

          let nei_xyz = [ x+dxyz[idir][0], y+dxyz[idir][1], z+dxyz[idir][2] ];

          let nei_tile = 0;
          let cell = xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, D);

          if (DEBUG_LEVEL > 1) {
            console.log(x,y,z, "-->", nei_xyz[0], nei_xyz[1], nei_xyz[2], xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, 1));
          }

          if (cell >= 0) {
            nei_tile = tile_level[ nei_xyz[2] ][ nei_xyz[1] ][ nei_xyz[0] ];
          }

          let found = 0;
          for (let rule_idx=0; rule_idx<poms.rule.length; rule_idx++) {
            if ( (poms.rule[rule_idx][0] == src_tile) &&
                 (poms.rule[rule_idx][1] == nei_tile) &&
                 (poms.rule[rule_idx][2] == idir) &&
                 (poms.rule[rule_idx][3] == 1) ) {
              found = 1;
              break;
            }
          }

          if (!found) { valid = 0; }

          if (DEBUG_LEVEL > 1) {
            console.log("  found:", found, src_tile, "[", poms.name[src_tile], "]", "-(", idir, "{", idir_descr[idir], "}", ")->", nei_tile, "[", poms.name[nei_tile], "]");
          }

        }

      }
    }
  }

  return valid;
}

function consistency_check_array(poms, tile_level) {
  let W = tile_level[0].length;
  let H = tile_level.length;

  let dxyz = [
    [1,0,0], [-1,0,0],
    [0,1,0], [0,-1,0],
    [0,0,1], [0,0,-1]
  ];

  let idir_descr = [ "+x", "-x", "+y", "-y", "+z", "-z" ];

  let name_map = {};
  for (let tile_id=0; tile_id<poms.name; tile_id++) {
    name_map[ poms.name[tile_id] ] = tile_id;
  }

  let valid = 1;

  let z = 0;
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {

      let src_tile = tile_level[y][x];

      for (let idir=0; idir<6; idir++) {

        let nei_xyz = [ x+dxyz[idir][0], y+dxyz[idir][1], z+dxyz[idir][2] ];

        let nei_tile = 0;
        let cell = xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, 1);

        if (DEBUG_LEVEL > 1) {
          console.log(x,y,z, "-->", nei_xyz[0], nei_xyz[1], nei_xyz[2], xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, 1));
        }

        if (cell >= 0) {
          nei_tile = tile_level[ nei_xyz[1] ][ nei_xyz[0] ];
        }

        let found = 0;
        for (let rule_idx=0; rule_idx<poms.rule.length; rule_idx++) {
          if ( (poms.rule[rule_idx][0] == src_tile) &&
               (poms.rule[rule_idx][1] == nei_tile) &&
               (poms.rule[rule_idx][2] == idir) &&
               (poms.rule[rule_idx][3] == 1) ) {
            found = 1;
            break;
          }
        }

        if (found == 0) { valid = 0; }

        if (DEBUG_LEVEL > 1) {
          console.log("  found:", found, src_tile, "[", poms.name[src_tile], "]", "-(", idir, "{", idir_descr[idir], "}", ")->", nei_tile, "[", poms.name[nei_tile], "]");
        }

      }

    }
  }

  return valid;
}

function main_exsb(_opt) {

  //let poms_fn = "./bakaban_nr.0.json";
  //let level_fn = "../data/validation/bakaban.0.sol.exsb";

  let poms_fn = _opt.poms_fn;
  let level_fn = _opt.xsb_fn;

  let level_xsb = fs.readFileSync(level_fn, "utf8");

  if (DEBUG_LEVEL > 0) {
    console.log(";level loaded");
    if (DEBUG_LEVEL > 1) {
      console.log(level_xsb);
    }
  }

  let poms = JSON.parse( fs.readFileSync(poms_fn, "utf8") );

  if (DEBUG_LEVEL > 0) {
    console.log(";poms loaded");
  }

  let dxy = [
    { "x":  1, "y":  0 },
    { "x": -1, "y":  0 },
    { "x":  0, "y":  1 },
    { "x":  0, "y": -1 }
  ];

  let tile_level_sol = convert_exsb(poms, level_xsb);
  if (!tile_level_sol) { return 0; }

  for (let z=0; z<tile_level_sol.length; z++) {
    for (let y=0; y<tile_level_sol[z].length; y++) {
      let _row = [];
      for (let x=0; x<tile_level_sol[z][y].length; x++) {
        if (typeof tile_level_sol[z][y][x] === "undefined") {

          console.log("ERROR: @[", x, y,z,"], could not find tile:");
          let missing_tile = [ ["'", "'", "'"], ["'", "'", "'"], ["'", "'", "'" ] ];
          for (let idx=0; idx<dxy.length; idx++) {
            let tx = x+dxy[idx].x;
            let ty = y+dxy[idx].y;
            if ((tx>=0) && (tx<level_xsb[z][y].length) &&
                (ty>=0) && (ty<level_xsb[z].length)) {
              missing_tile[ty][tx] = level_xsb[z][ty][tx];
            }
          }
          console.log( missing_tile[0].join("") );
          console.log( missing_tile[1].join("") );
          console.log( missing_tile[2].join("") );

          return 0;
        }
      }
    }
  }


  if (DEBUG_LEVEL > 1) {

    console.log("===");
    console.log(tile_level_sol);
    console.log("===");

    for (let z=0; z<tile_level_sol.length; z++) {
      for (let y=0; y<tile_level_sol[z].length; y++) {
        let _row = [];
        for (let x=0; x<tile_level_sol[z][y].length; x++) {
          _row.push( tile_level_sol[z][y][x].toString() );
        }
        console.log(_row.join(", "));
      }
      console.log("---");
    }
    console.log("===");

  }

  let valid = consistency_check_sol(poms, tile_level_sol);

  if (!valid) {
    console.log("INCONSISTENT");
  }

  if (DEBUG_LEVEL > 0) {
    if (valid) { console.log("ok"); }
  }

  if (valid == 0) { return 1; }
  return 0;
}

function main_xsb(_opt) {
  //let poms_fn = "./sokoita_poms_bakaban.json";
  //let level_fn = "../data/bakaban.xsb";

  //let poms_fn = "./bakaban_nr.0.json";
  //let level_fn = "../data/validation/bakaban.0.sol.xsb";
  //let level_fn = "../data/validation/bakaban.0.xsb";

  let poms_fn = _opt.poms_fn;
  let level_fn = _opt.xsb_fn;

  let poms = JSON.parse( fs.readFileSync(poms_fn, "utf8") );

  if (DEBUG_LEVEL > 0) {
    console.log(";poms loaded");
  }

  let level_xsb = fs.readFileSync(level_fn, "utf8");

  if (DEBUG_LEVEL > 0) {
    console.log(";level loaded");
    if (DEBUG_LEVEL > 1) {
      console.log(level_xsb);
    }
  }

  let tile_level = convert_xsb(poms, level_xsb);
  if (!tile_level) { return 0; }

  if (DEBUG_LEVEL > 1) {
    console.log("===");
    console.log(tile_level);
    console.log("===");

    for (let y=0; y<tile_level.length; y++) {
      let _row = [];
      for (let x=0; x<tile_level[y].length; x++) {
        _row.push( tile_level[y][x].toString() );
      }
      console.log(_row.join(", "));
    }
    console.log("===");
  }

  let valid = consistency_check_array(poms, tile_level);

  if (!valid) {
    console.log("INCONSISTENT");
  }

  if (DEBUG_LEVEL > 0) {
    if (valid) { console.log("ok"); }
  }

  if (valid == 0) { return 1; }
  return 0;
}

//----
//----
//----
//----
// command line processing
//----


var long_opt = [
  "h", "(help)",
  "v", "(version)",
  "V", ":(verbose)",

  "C", ":(poms)",

  "i", ":(xsb)"
];

var long_opt_desc = [
  "help (this screen)",
  "version",
  "verbosity level",

  "POMS config file",
  "XSB file",

  ""
];


function show_help(fp) {
  fp.write("\ncheck_consistency.js, version ");
  show_version(fp);
  fp.write("\n");

  for (let i=0; i<long_opt.length; i+=2) {
    let s = "  -" + long_opt[i] + ",--" + long_opt[i+1].replace( /:?\(/, '').replace( /\)$/, '' );
    fp.write( s );

    for (let space=0; space < (24-s.length); space++) { fp.write(" "); }
    fp.write( long_opt_desc[Math.floor(i/2)] + "\n");
  }
  fp.write("\n");
}

function show_version(fp) {
  fp.write( SOKOITA_CHECK_CONSISTENCY_VERSION + "\n");
}

var parser = new getopt.BasicParser(long_opt.join(""), process.argv);

var exec = 1;
var main_opt = {
  "poms_fn": "",
  "xsb_fn": ""
};

while ((arg_opt = parser.getopt()) !== undefined) {
  switch (arg_opt.option) {
    case 'h':
      show_help(process.stdout);
      exec = 0;
      break;
    case 'v':
      show_version(process.stdout);
      exec = 0;
      break;

    case 'V':
      DEBUG_LEVEL = parseInt(arg_opt.optarg);
      break;

    case 'C':
      main_opt.poms_fn = arg_opt.optarg;
      break;
    case 'i':
      main_opt.xsb_fn = arg_opt.optarg;
      break;

    default:
      show_help(process.stderr);
      exec = 0;
      break;
  }
}

if (exec != 0) {

  if ((main_opt.poms_fn.length == 0) ||
      (main_opt.xsb_fn.length == 0)) {
    process.stderr.write("provide POMS config file and XSB file\n");
    show_help(process.stderr);
  }
  else {

    if (main_opt.xsb_fn.match( /\.exsb$/ )) {
      main_exsb(main_opt);
    }
    else {
      main_xsb(main_opt);
    }
  }

}


