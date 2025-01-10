// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this file has waived all copyright and related or neighboring rights
// to this file.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

let N = 8;
let TOKEN = [ '.', '#' ];

let DEBUG_LEVEL = 1;

var ERR_CODE = {
  "0": "valid",
  "-1": "space rowcon",
  "-2": "wall rowcon",
  "-3": "space colcon",
  "-4": "wall colcon",
  "-5": "monster",
  "-6": "treasure",
  "-7": "2x2 space",
  "-8": "alcove",
  "-9": "disjoint"
};



function is_valid_monster(grid, cell) {

  let cy = Math.floor(cell/N);
  let cx = cell - (N*cy);

  let d = [
    { "x": 1, "y": 0 },
    { "x":-1, "y": 0 },
    { "x": 0, "y": 1 },
    { "x": 0, "y":-1 }
  ];

  let wall_nei = 0;
  let space_nei = 0;
  for (let i=0; i<4; i++) {
    let nei_x = cx + d[i].x;
    let nei_y = cy + d[i].y;

    if ((nei_x < 0) || (nei_x >= N) ||
        (nei_y < 0) || (nei_y >= N)) {
      wall_nei++;
      continue;
    }

    let nei_cell = nei_y*N + nei_x;

    if (grid[nei_cell] == '#') {
      wall_nei++;
    }
    else if (grid[nei_cell] == '.') {
      space_nei++;
    }

  }

  //console.log("testing monster:", wall_nei, space_nei);
  //emit(grid);


  //if ((wall_nei==3) && (space_nei==1)) { return true; }
  if ((wall_nei > 3) || (space_nei > 1)) { return false; }
  return true;
}

function is_valid_treasure(grid, cell) {

  let ty = Math.floor(cell/N);
  let tx = cell - (ty*N);

  for (let cy=(ty-1); cy<(ty+2); cy++) {
    if ((cy<1) || (cy>=(N-1))) { continue; }
    for (let cx=(tx-1); cx<(tx+2); cx++) {
      if ((cx<1) || (cx>=(N-1))) { continue; }

      //console.log("; treasure", cx, cy);
      //emit(grid);

      let found = true;
      for (let dy=-1; dy<2; dy++) {
        for (let dx=-1; dx<2; dx++) {

          let y = cy+dy;
          let x = cx+dx;

          let tcell = y*N + x;

          if ((grid[tcell] != '_') &&
              (grid[tcell] != '.') &&
              (grid[tcell] != 't')) {
            found = false;
            break;
          }
        }
        if (!found) { break; }
      }

      if (found) {

        //console.log("found?", cx, cy);
        //emit(grid);

        let wall_count = 0;
        let space_count = 0;
        for (let dy=-1; dy<2; dy++) {
          for (let dx=-2; dx<3; dx+=4) {
            let x = cx+dx;
            let y = cy+dy;
            if      ((x<0) || (x>=N)) { wall_count++; }
            else if ((y<0) || (y>=N)) { wall_count++; }
            else if (grid[y*N + x] == '#') { wall_count++; }
            else if (grid[y*N + x] == '.') { space_count++; }
          }
        }

        for (let dx=-1; dx<2; dx++) {
          for (let dy=-2; dy<3; dy+=4) {
            let y = cy+dy;
            let x = cx+dx;
            if      ((x<0) || (x>=N)) { wall_count++; }
            else if ((y<0) || (y>=N)) { wall_count++; }
            else if (grid[y*N + x] == '#') { wall_count++; }
            else if (grid[y*N + x] == '.') { space_count++; }
          }
        }

        //console.log("; wall_count:", wall_count, "space_count:", space_count);

        //if ((wall_count > 11) || (space_count > 1)) { return false; }
        //return true;
        if ((wall_count <= 11) && (space_count <= 1)) { return true; }

      }

    }
  }

  return false;
}

function is_disconnected(grid) {
  let Q = [];

  let d = [
    {"x": 1, "y": 0},
    {"x":-1, "y": 0},
    {"x": 0, "y": 1},
    {"x": 0, "y":-1}
  ];

  let _g = [];
  for (let cell=0; cell<grid.length; cell++) {
    _g.push(grid[cell]);
  }

  for (let y=0; y<N; y++) {
    for (let x=0; x<N; x++) {
      let cell = y*N + x;
      if ((grid[cell] == '.') ||
          (grid[cell] == '_') ||
          (grid[cell] == 't') ||
          (grid[cell] == 'm')) {
        Q.push({"x":x, "y":y})
      }
      if (Q.length > 0) { break; }
    }
    if (Q.length > 0) { break; }
  }

  while (Q.length > 0) {

    let p = Q.pop();
    let cell = p.y*N + p.x;

    if (_g[cell] == 'x') { continue; }
    if (_g[cell] == '#') { continue; }
    if ((_g[cell] == '.') ||
        (_g[cell] == '_') ||
        (_g[cell] == 't') ||
        (_g[cell] == 'm')) {
      _g[cell] = 'x';

      for (let i=0; i<4; i++) {
        let x = p.x + d[i].x;
        let y = p.y + d[i].y;
        if ((x<0) || (x>=N) ||
            (y<0) || (x>=N)) { continue; }
        Q.push({"x":x, "y":y});
      }
    }

  }

  for (let cell=0; cell<_g.length; cell++) {
    if ((_g[cell] == '.') ||
        //(_g[cell] == '_') ||
        (_g[cell] == 'm') ||
        (_g[cell] == 't')) { return true; }
  }

  return false;
}

function has_alcove(grid) {

  let d = [
    { "x": 1, "y": 0 },
    { "x":-1, "y": 0 },
    { "x": 0, "y": 1 },
    { "x": 0, "y":-1 }
  ];

  for (let cy=0; cy<N; cy++) {
    for (let cx=0; cx<N; cx++) {

      let space_count = 0;
      let wall_count = 0;
      let unk_count = 0;

      for (let i=0; i<4; i++) {
        let x = cx + d[i].x;
        let y = cy + d[i].y;

        if ((x<0) || (x>=N) ||
            (y<0) || (y>=N)) {
          wall_count++;
          continue;
        }

        let cell = y*N + x;

        if      (grid[cell] == '.') { space_count++; }
        else if (grid[cell] == 't') { space_count++; }
        else if (grid[cell] == 'm') { space_count++; }
        else if (grid[cell] == '#') { wall_count++; }
        else if (grid[cell] == '_') { unk_count++; }

      }

      if ((wall_count >= 3) &&
          (grid[cy*N + cx] == '.')) {
        return true;
      }

    }
  }

  return false;
}

function valid(grid, template, col_constraint, row_constraint) {

  let row_sum = [];
  let col_sum = [];

  // validate row and column constraints
  //
  for (let y=0; y<N; y++) {
    let wall_count = 0;
    let space_count = 0;
    let unk_count = 0;
    for (let x=0; x<N; x++) {
      let cell = y*N + x;
      if      (grid[cell] == '#') { wall_count++; }
      else if (grid[cell] == '.') { space_count++; }
      else if (grid[cell] == 't') { space_count++; }
      else if (grid[cell] == 'm') { space_count++; }
      else if (grid[cell] == '_') { unk_count++; }
    }

    //if (s != row_constraint[y]) { return false; }
    if (space_count > (N-row_constraint[y])) { return -1; }
    if (wall_count > row_constraint[y]) { return -2; }
  }

  for (let x=0; x<N; x++) {
    let wall_count = 0;
    let space_count = 0;
    let unk_count = 0;
    for (let y=0; y<N; y++) {
      let cell = y*N + x;
      if      (grid[cell] == '#') { wall_count++; }
      else if (grid[cell] == '.') { space_count++; }
      else if (grid[cell] == 't') { space_count++; }
      else if (grid[cell] == 'm') { space_count++; }
      else if (grid[cell] == '_') { unk_count++; }
    }

    //if (s != col_constraint[x]) { return false; }
    if (space_count > (N-col_constraint[x])) { return -3; }
    if (wall_count > col_constraint[x]) { return -4; }
  }

  // test for valid treasure and mostner placement, centered
  // at where the tokens appear.
  //
  for (let y=0; y<N; y++) {
    for (let x=0; x<N; x++) {
      let cell = y*N + x;

      if (grid[cell] == 'm') {
        if (!is_valid_monster(grid, cell)) { return -5; }
      }

      if (grid[cell] == 't') {
        if (!is_valid_treasure(grid, cell)) { return -6; } }
    }
  }


  // check for no 2x2 spaces
  for (let y=0; y<(N-1); y++) {
    for (let x=0; x<(N-1); x++) {
      let space_count=0;
      for (let dy=0; dy<2; dy++) {
        for (let dx=0; dx<2; dx++) {
          let cell = (y+dy)*N + x+dx;
          if (grid[cell] == '.') { space_count++; }
        }
      }
      if (space_count==4) {

        let treasure_found = false;
        for (let cy=(y-1); cy<(y+2); cy++) {
          for (let cx=(x-1); cx < (x+2); cx++) {

            let wall_count = 0;
            let space_count = 0;
            let treasure_count = 0;
            let monster_count = 0;
            let unk_count = 0;

            for (let dy=0; dy<2; dy++) {
              for (let dx=0; dx<2; dx++) {

                let _y = cy+dy;
                let _x = cx+dx;

                if ((_x < 0) || (_x >= N) ||
                    (_y < 0) || (_y >= N)) {
                  wall_count++;
                  continue;
                }

                let cell = _y*N + _x;
                if (grid[cell] == '.') { space_count++; }
                else if (grid[cell] == 't') { treasure_count++; }
                else if (grid[cell] == 'm') { monster_count++; }
                else if (grid[cell] == '_') { unk_count++; }
                else if (grid[cell] == '#') { wall_count++; }
              }
            }

            if ((treasure_count == 1) &&
                ((unk_count + space_count)==3)) {
              treasure_found = true;
            }

            if (treasure_found) { break; }
            
          }
          if (treasure_found) { break; }
        }

        if (!treasure_found) {
          return -7;
        }
      }
    }
  }

  if (has_alcove(grid)) { return -8; }
  if (is_disconnected(grid)) { return -9; }

  return 0;
}

function emit(grid) {

  lines = [];
  for (let cell=0; cell<(N*N); cell++) {

    let pfx = "";
    if ((cell>0) && ((cell%N)==0)) {
      pfx = "\n";
    }

    lines.push( pfx + grid[cell] );
  }

  //console.log("--");
  console.log(lines.join("") );
  console.log("");
  //console.log("--");
}

function realize_r(grid, cell, template, col_constraint, row_constraint) {

  if (cell == (N*N)) {
    let r = valid(grid, template, col_constraint, row_constraint);
    if (r == 0) {
      console.log("FOUND");
      emit(grid);
    }
    else {
      if (DEBUG_LEVEL > 0) {
        console.log("nopef: @", cell, "(", r, ":", ERR_CODE[r], ")");
        emit(grid);
      }
    }
    return;
  }

  let r = valid(grid, template, col_constraint, row_constraint);
  if (r != 0) {

    if (DEBUG_LEVEL > 0) {
      console.log("nope: @", cell, "(", r, ":", ERR_CODE[r], ")");
      emit(grid);
    }
    return;
  }

  let row = Math.floor(cell / N);
  let col = cell - (row*N);

  if (template[cell] == '_') {
    for (let v=0; v<TOKEN.length; v++) {
      grid[cell] = TOKEN[v];
      realize_r(grid, cell+1, template, col_constraint, row_constraint);
      grid[cell] = template[cell];
    }
  }
  else {
    grid[cell] = template[cell];
    realize_r(grid, cell+1, template, col_constraint, row_constraint);
    grid[cell] = template[cell];
    return;
  }


}

function test1() {
  col_constraint = [ 1, 1, 1, 2, 2 ];
  row_constraint = [ 1, 0, 1, 4, 1 ];
  template[1*N + 2] = 't';
}

function test0() {
  template[ 1*N + 0 ] = 'm';
  for (let idx=0; idx<N; idx++) {
    col_constraint.push( Math.floor( Math.random()*(N-1) ) + 1 );
    row_constraint.push( Math.floor( Math.random()*(N-1) ) + 1 );
    //col_constraint.push( Math.floor( Math.random()*(N) ) + 0 );
    //row_constraint.push( Math.floor( Math.random()*(N) ) + 0 );
    //col_constraint.push( 2 );
    //row_constraint.push( 2 );
  }
}

function xy2cell(x,y) {
  return y*N + x;
}

function lev2() {
col_constraint = [4,2,5,0,6,2,4,2];
row_constraint = [5,2,2,1,5,3,2,5];

template[ xy2cell(2,2) ] = 'm';
template[ xy2cell(0,6) ] = 'm';
template[ xy2cell(6,2) ] = 't';
template[ xy2cell(3,7) ] = 'm';
template[ xy2cell(5,7) ] = 'm';
template[ xy2cell(7,7) ] = 'm';
}


function lev42() {
col_constraint = [1,4,1,4,5,2,3,3];
row_constraint = [3,4,3,3,1,5,1,3];

template[ xy2cell(1,0) ] = 'm';
template[ xy2cell(6,0) ] = 'm';
template[ xy2cell(3,4) ] = 'm';
template[ xy2cell(6,4) ] = 't';
template[ xy2cell(4,7) ] = 'm';
template[ xy2cell(7,7) ] = 'm';

/*
let sol_str = "#m#...m#" +
  "....####" +
  ".#.##..." +
  ".#.##..." +
  "...m#t.." +
  ".#.##.##" +
  ".#......" +
  "...#m##m";
*/

//let sol = sol_str.split("");

//emit(sol);
//console.log(">>>", valid(sol, template, col_constraint, row_constraint));
}

function lev44() {
col_constraint = [2,3,1,5,3,1,3,5];
row_constraint = [5,3,3,2,5,0,4,1];
template[ xy2cell(5,2) ] = 't';
}

function lev56() {
col_constraint = [5,3,4,2,4,4,2,5];
row_constraint = [4,1,5,2,4,5,2,6];
template[ xy2cell(5,0) ] = 'm';
template[ xy2cell(7,1) ] = 'm';
template[ xy2cell(7,3) ] = 'm';
template[ xy2cell(7,5) ] = 'm';
template[ xy2cell(1,6) ] = 'm';
template[ xy2cell(3,7) ] = 'm';
template[ xy2cell(5,7) ] = 'm';

let sol_str =
  "#...#m##" +
  "..#....m" +
  ".###.#.#" +
  "..#..#.m" +
  "#...##.#" +
  "##.###.m" +
  "#m.....#" +
  "###m#m##";

let sol = sol_str.split("");

emit(sol);
emit(template);
console.log(">>>", valid(sol, template, col_constraint, row_constraint));
}

function levinf() {
col_constraint = [4,4,2,5,5,3,2,5];
row_constraint = [2,6,3,5,4,2,4,4];

template[ xy2cell(0,0) ] = 'm';
template[ xy2cell(2,1) ] = 'm';
template[ xy2cell(7,2) ] = 'm';
template[ xy2cell(5,5) ] = 'm';
template[ xy2cell(7,5) ] = 'm';
template[ xy2cell(4,7) ] = 'm';
template[ xy2cell(7,7) ] = 'm';
template[ xy2cell(1,6) ] = 't';

emit(template);
}

function gen0() {
  let sol = [];
}

function mk0() {
  let data = {
    "size": [N,N],
    "col_constraint": [3,1,3,4,4,0,4,1],
    "row_constraint": [2,2,2,4,2,3,3,2],
    "monster": [
      {"x":0, "y":4},
      {"x":0, "y":7},
      {"x":7, "y":7}
    ],
    "treasure": [
      {"x":6, "y":1},
      {"x":0, "y":2},
      {"x":3, "y":5}
    ],
    "grid": [],
    "template": []
  };

  for (let i=0; i<N*N; i++) {
    data.grid.push('_');
    data.template.push('_');
  }


  for (let idx=0; idx<data.monster.length; idx++) {
    let x = data.monster[idx].x;
    let y = data.monster[idx].y;
    data.template[ xy2cell(x,y) ] = 'm';
  }

  for (let idx=0; idx<data.treasure.length; idx++) {
    let x = data.treasure[idx].x;
    let y = data.treasure[idx].y;
    data.template[ xy2cell(x,y) ] = 't';
  }

  for (let cell=0; cell<data.grid.length; cell++) {
    data.grid[cell] = data.template[cell];
  }

  return data;
}



function __x() {
}

function _main() {
  let col_constraint = [];
  let row_constraint = [];

  let grid = [];
  let template = [];
  for (let idx=0; idx<(N*N); idx++) {
    grid.push("_");
    template.push('_');
  }

  col_constraint = [4,4,2,5,5,3,2,5];
  row_constraint = [2,6,3,5,4,2,4,4];

  template[ xy2cell(0,0) ] = 'm';
  template[ xy2cell(2,1) ] = 'm';
  template[ xy2cell(7,2) ] = 'm';
  template[ xy2cell(5,5) ] = 'm';
  template[ xy2cell(7,5) ] = 'm';
  template[ xy2cell(4,7) ] = 'm';
  template[ xy2cell(7,7) ] = 'm';
  template[ xy2cell(1,6) ] = 't';

  for (let cell=0; cell<N*N; cell++) {
    if (template[cell] != '_') { grid[cell] = template[cell]; }
  }

  console.log("; col:", col_constraint.join(","));
  console.log("; row:", row_constraint.join(","));
  realize_r(grid, 0, template, col_constraint, row_constraint);

}



function main() {
  let game_data = mk0();

  emit(game_data.template);

  console.log("; col:", game_data.col_constraint.join(","));
  console.log("; row:", game_data.row_constraint.join(","));
  realize_r(game_data.grid, 0, game_data.template, game_data.col_constraint, game_data.row_constraint);
}


main();
