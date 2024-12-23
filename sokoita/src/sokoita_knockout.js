/*
 * To the extent possible under law, the person who associated CC0 with
 * this file has waived all copyright and related or neighboring rights
 * to this file.
 *
 * You should have received a copy of the CC0 legalcode along with this
 * work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 *
 */

// Deadlock patterns in the sptial domain.
//
// special tokens '>', '<', 'v', '^' for 0 or
// more repetitions (not including the origin token)
// in the appropriate directions.
//
// A pattern here means that if this pattern matches all
// but one non-wall location, that location can have all
// supertiles with the matching token removed from the
// cell's domain.
//
// For example, for the sptial knockout pattern:
//
// $$
// ##
//
// If we find a pattern:
//
// ?$
// ##
//
// With '?' in some indeterminate state, we can remove all
// supertiles that have a '$' (crate) at its center.
//
var knockout_base_spatial = [
  [ "!$",
    "##" ],

  [ "$!",
    "##" ],

  [ "!$",
    "#$" ],

  [ "$!",
    "#$" ],

  [ "$$",
    "#!" ],

  [ "!$",
    "$$" ],

  [ "###",
    "# !",
    "#$?" ],

  [ "###",
    "# $",
    "#!?" ],

  [ "#####",
    "# ! #" ]

  //[ "##>##>#",
  //  "# >$ >#" ]
];

var knockout_base_temporal = [
  [ [ " $ $",
      "# ##" ]

    [ "  !$",
      "# ##" ] ]
];

function pat_rot(pat) {
  let row = pat.length;
  let col = pat[0].length;


  let rot_pat = [];
  for (let c=0; c<col; c++) {
    rot_pat.push([]);
    for (let r=0; r<row; r++) {
      rot_pat[c].push('?');
    }
  }

  for (let r=0; r<row; r++) {
    for (let c=0; c<col; c++) {
      let rr = c;
      let rc = row-r-1;
      rot_pat[rr][rc] = pat[r][c];
    }
  }

  let res_pat = [];
  for (let c=0; c<col; c++) {
    res_pat.push( rot_pat[c].join("") );
  }

  return res_pat;
}

function back_to_ascii(pat) {
  let row = pat[0];
  let col = pat[1];

  let s_pat = [];

  let idx = 2;
  for (let r=0; r<row; r++) {
    s_pat.push([]);
    for (let c=0; c<col; c++) {
      s_pat[r].push( String.fromCharCode(pat[idx]) );
      idx++;
    }
  }

  let res_pat = [];
  for (let r=0; r<row; r++) {
    res_pat.push( s_pat[r].join("") );
  }
  return res_pat;
}

function pretty_pat(pat) {
  console.log( pat.join("\n") );
}

function key_str(pat) {
  return pat.join(",");
}

function construct_knockout_spatial(base) {

  let info = [];

  let key_lib = {};

  for (let idx=0; idx<base.length; idx++) {
    let pat = base[idx];
    let idx_rot = 0;

    let cur_pat = pat;
    do {

      let _row = cur_pat.length;
      let _col = cur_pat[0].length;

      let cur_info = [ _row, _col ];
      for (let r=0; r<_row; r++) {
        for (let c=0; c<_col; c++) {
          cur_info.push( cur_pat[r].charCodeAt(c) );
        }
      }

      cur_pat = pat_rot(cur_pat);
      idx_rot++;

      let key = key_str(cur_pat);
      if (key in key_lib) { continue; }
      key_lib[key] = 1;

      info.push(cur_info);
    } while (idx_rot < 4);

  }

  let print_structure = 1;

  if (print_structure) {
    console.log("  int8_t encode_pat[] = {");
  }

  let fin_array = [];
  for (let i=0; i<info.length; i++) {
    //console.log(info[i]);
    //let t = back_to_ascii( info[i] );
    //console.log( t );
    //pretty_pat(t);

    let disp_line = [];

    for (let j=0; j<info[i].length; j++) {
      fin_array.push( info[i][j] );

      disp_line.push( info[i][j].toString() );
    }

    if (print_structure) {
      console.log("    " + disp_line.join(", ") + ',');
    }

  }

  if (print_structure) {
    console.log("    0\n  };");
  }

  return fin_array;
}

construct_knockout_spatial(knockout_base_spatial);
