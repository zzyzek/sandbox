// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//     
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

var fs = require("fs");

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

  console.log("-----\npadded xsb:");
  for (let y=0; y<pad_level.length; y++) {
    console.log( pad_level[y].join("") );
  }
  console.log("-----\n");

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
      tile_level[y].push( name_id[level_name[y][x]] );
    }
  }





  return tile_level;

  /*
  console.log(W, H);
  for (let y=0; y<H; y++) {
    let a = [];
    for (let x=0; x<W; x++) {
      a.push( level[y][x] + ":" + level_name[y][x] + ":" + tile_level[y][x].toString());
    }
    console.log(a.join("   "));
  }
  */
  //for (let i=0; i<level.length; i++) { console.log(i, level[i], level_name); }
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

        console.log(x,y,z, "-->", nei_xyz[0], nei_xyz[1], nei_xyz[2], xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, 1));
        if (cell >= 0) {
          nei_tile = tile_level[ nei_xyz[1] ][ nei_xyz[0] ];
        }

        let key = src_tile.toString() + ":" + nei_tile.toString() + ":" + idir.toString();
        console.log("  ", src_tile, "[", poms.name[src_tile], "]", "-(", idir, ")->", nei_tile, "[", poms.name[nei_tile], "]", ":", rule_map[key]);


      }

    }
  }
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

  let z = 0;
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {

      let src_tile = tile_level[y][x];

      for (let idir=0; idir<6; idir++) {

        let nei_xyz = [ x+dxyz[idir][0], y+dxyz[idir][1], z+dxyz[idir][2] ];

        let nei_tile = 0;
        let cell = xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, 1);

        console.log(x,y,z, "-->", nei_xyz[0], nei_xyz[1], nei_xyz[2], xyz2cell(nei_xyz[0], nei_xyz[1], nei_xyz[2], W, H, 1));
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

        console.log("  found:", found, src_tile, "[", poms.name[src_tile], "]", "-(", idir, "{", idir_descr[idir], "}", ")->", nei_tile, "[", poms.name[nei_tile], "]");

        //let key = src_tile.toString() + ":" + nei_tile.toString() + ":" + idir.toString();
        //console.log("  ", src_tile, "[", poms.name[src_tile], "]", "-(", idir, ")->", nei_tile, "[", poms.name[nei_tile], "]", ":", rule_map[key]);


      }

    }
  }
}

function main() {
  let poms_fn = "./sokoita_poms_bakaban.json";
  let level_fn = "../data/bakaban.xsb";

  let poms = JSON.parse( fs.readFileSync(poms_fn, "utf8") );

  console.log("poms loaded");

  let level_xsb = fs.readFileSync(level_fn, "utf8");

  console.log("level loaded");


  let level = [
  ];

  console.log(level_xsb);

  let tile_level = convert_xsb(poms, level_xsb);

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


  consistency_check_array(poms, tile_level);
}

main();
