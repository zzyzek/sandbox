
let g = [];

for (let z=0; z<3; z++) {
  g.push([]);
  for (let y=0; y<3; y++) {
    g[z].push([]);
    for (let x=0; x<3; x++) {
      g[z][y].push(-1);
    }
  }
}

function print_path(path) {
  for (let i=0; i<path.length; i++) {
    console.log(path[i][0], path[i][1], path[i][2]);
  }
  console.log("\n");
}

let sfreq = {};

function filter(path) {
  let n = path.length;

  let pe = path[n-1];

  if ((pe[0] != 2) || (pe[1] != 0) || (pe[2] != 0)) {
    return false;
  }

  let straight_count=0;
  for (let i=1; i<(n-1); i++) {
    let count = 0;
    for (let xyz=0; xyz<3; xyz++) {
      if ((path[i-1][xyz] == path[i][xyz]) && (path[i][xyz] == path[i+1][xyz])) {
        count++;
      }
    }
    if (count >= 2) { straight_count++; }
  }

  if (!(straight_count in sfreq)) { sfreq[straight_count] = 0; }
  sfreq[straight_count] ++;

  if (straight_count > 0) { return false; }

  return true;
}

function enumerate(g, idx, p, path) {
  let dxyz = [
    [1,0,0], [-1, 0, 0],
    [0,1,0], [ 0,-1, 0],
    [0,0,1], [ 0, 0,-1]
  ];

  for (let xyz=0; xyz<3; xyz++) {
    if ((p[xyz]<0) || (p[xyz]>=3)) { return; }
  }
  if (g[p[2]][p[1]][p[0]] >= 0) { return; }

  g[p[2]][p[1]][p[0]] = idx;
  path.push(p);

  if (idx==(3*3*3-1)) {

    if (filter(path)) {
      print_path(path);
    }

    path.pop();
    g[p[2]][p[1]][p[0]] = -1;
    return;
  }


  for (let idir=0; idir<6; idir++) {

    let q = [0,0,0];
    for (let xyz=0; xyz<3; xyz++) {
      q[xyz] = p[xyz] + dxyz[idir][xyz];
    }

    enumerate(g, idx+1, q, path);
  }
  

  path.pop();
  g[p[2]][p[1]][p[0]] = -1;
}


enumerate(g, 0, [0,0,0], []);

for (let key in sfreq) {
  console.log("#", key, sfreq[key]);
}
