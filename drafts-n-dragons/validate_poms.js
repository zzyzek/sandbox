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


    //WIP check for number consistency

  }

}

check_rule(poms);

console.log("...");
