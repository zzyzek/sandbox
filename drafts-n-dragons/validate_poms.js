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
var poms = JSON.parse( fs.readFileSync("dnd.poms", "utf8") );

function check_tile( poms ) {


  if (poms.name[0] != '#00#00#00#00') {

    console.log("ERROR: 0 tile not expected", poms.name[0]);

    return -1;
  }

  for (let idx=1; idx<poms.name.length; idx++) {

    let name = poms.name[idx];

    // type, column constraint, row constraint

    let tile = [
      [ [ name[0], parseInt(name[1]), parseInt(name[2]) ],
        [ name[3], parseInt(name[4]), parseInt(name[5]) ] ],
      [ [ name[6], parseInt(name[7]), parseInt(name[8]) ],
        [ name[9], parseInt(name[10]), parseInt(name[11]) ] ]
    ];

    let t00 = tile[0][0][0];
    let t01 = tile[0][1][0];

    let t10 = tile[1][0][0];
    let t11 = tile[1][1][0];

    let c00 = tile[0][0][1];
    let c10 = tile[1][0][1];

    let c01 = tile[0][1][1];
    let c11 = tile[1][1][1];

    let r00 = tile[0][0][2];
    let r01 = tile[0][1][2];

    let r10 = tile[1][0][2];
    let r11 = tile[1][1][2];

    if ((t10 == 'w') && (c10 != (c00-1))) {
      console.log("ERROR: tile:", idx, "(", name, ") invalid left column wall transition");
      return -1;
    }

    if ((t11 == 'w') && (c11 != (c01-1))) {
      console.log("ERROR: tile:", idx, "(", name, ") invalid right column wall transition");
      return -1;
    }

    if ((t01 == 'w') && (r01 != (r00-1))) {
      console.log("ERROR: tile:", idx, "(", name, ") invalid top row wall transition");
      return -1;
    }

    if ((t11 == 'w') && (r11 != (r10-1))) {
      console.log("ERROR: tile:", idx, "(", name, ") invalid bottom row wall transition");
      return -1;
    }


    if ((t10 == 's') && (c10 != (c00))) {
      console.log("ERROR: tile:", idx, "(", name, ") invalid left column space transition");
      return -1;
    }

    if ((t11 == 's') && (c11 != (c01))) {
      console.log("ERROR: tile:", idx, "(", name, ") invalid right column space transition");
      return -1;
    }

    if ((t01 == 's') && (r01 != (r00))) {
      console.log("ERROR: tile:", idx, "(", name, ") invalid top row space transition");
      return -1;
    }

    if ((t11 == 's') && (r11 != (r10))) {
      console.log("ERROR: tile:", idx, "(", name, ") invalid bottom row space transition");
      return -1;
    }

  }
}

function check_rule( poms ) {

  let name = poms.name;
  let rule = poms.rule;

  let name_len = 3;

  let oppo = [ 1,0, 3,2 ];
  let idir_overlap_idx = [
    [ 1*name_len, 3*name_len ],
    [ 0*name_len, 2*name_len ],

    [ 0*name_len, 1*name_len ],
    [ 2*name_len, 3*name_len ]
  ];

  let ioi = idir_overlap_idx;

  for (let idx=0; idx<rule.length; idx++) {

    let src_tile = rule[idx][0];
    let dst_tile = rule[idx][1];
    let idir = rule[idx][2];

    if ((idir == 4) || (idir == 5)) {
      if ((src_tile != 0) && (dst_tile != 0)) {
        console.log("ERROR: rule[", idx, "]:", rule[idx]);
        return -1;
      }
      continue;
    }

    if (src_tile == 0) { continue; }
    if (dst_tile == 0) { continue; }

    let rdir = oppo[idir];

    let src_name = name[ src_tile ];
    let dst_name = name[ dst_tile ];

    let src_nei_pat = src_name.slice( ioi[idir][0], ioi[idir][0] + name_len) + src_name.slice( ioi[idir][1], ioi[idir][1] + name_len );
    let dst_nei_pat = dst_name.slice( ioi[rdir][0], ioi[rdir][0] + name_len) + dst_name.slice( ioi[rdir][1], ioi[rdir][1] + name_len );

    if (src_nei_pat != dst_nei_pat) {
      console.log("ERROR: rule[", idx, "]: invalid overlap (idir:", idir, ", src:", src_name, ", dst:", dst_name, ")", src_nei_pat, dst_nei_pat);
      return -1;
    }

  }

}

check_tile(poms);
check_rule(poms);

console.log("...");
