
// random experimetns for generalized moore curve.
// All this is pretty haphazard and is mostly scratch pad.

let constraint_table = {
  //          A    B    C    D    E    F    G    H
  "alpha": [ "a", "b", "F", "d", "e", "f", "g", "A" ],
  "beta":  [ "a", "A", "c", "d", "F", "f", "g", "h" ],
  "gamma": [ "a", "b", "c", "A", "e", "f", "F", "h" ],
};

function print_ctable(ctable) {

  let colname = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  let row_name = ["alpha:", "beta :", "gamma:" ];

  console.log("      ", colname.join(" "));

  for (let i=0; i<3; i++) {
    let a = [];
    for (let j=0; j<ctable[i].length; j++) {
      a.push( (ctable[i][j] >= 0) ? ctable[i][j].toString() : '.' );
    }

    console.log(row_name[i], a.join(" "))

  }
}

function psum(ctable, idx) {
  return ( (ctable[0][idx] < 0) ? 0 : ctable[0][idx] ) +
    ( (ctable[1][idx] < 0) ? 0 : ctable[1][idx] ) +
    ( (ctable[2][idx] < 0) ? 0 : ctable[2][idx] );
}

function xxx() {

  let idx_name = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' ];

  for (let abg=0; abg<8; abg++) {

    let ctable = [
      [ -1, -1, -1, -1, -1, -1, -1, -1 ],
      [ -1, -1, -1, -1, -1, -1, -1, -1 ],
      [ -1, -1, -1, -1, -1, -1, -1, -1 ]
    ];

    let g = abg%2;
    let b = Math.floor(abg/2)%2;
    let a = Math.floor(abg/4)%2;

    let a_forbid = ((1-0)^a).toString() + ((1-0)^g).toString();
    let f_forbid = a_forbid;

    // initial constrainnt and propagation
    //
    ctable[0][0] = 0;
    ctable[0][7] = a;

    ctable[1][0] = 0;
    ctable[1][1] = b;

    ctable[2][0] = 0;
    ctable[2][3] = a;


    ctable[0][5] = 0;
    ctable[0][2] = a;

    ctable[1][5] = 0;
    ctable[1][4] = b;

    ctable[2][5] = 0;
    ctable[2][6] = g;

    if ((abg == 1) ||
        (abg == 3) ||
        (abg == 4) ||
        (abg == 6)) {

      let v0 = 1, v1 = 1, v2 = 0;

      ctable[0][5] = v0;
      ctable[0][2] = (v0-a);

      ctable[1][5] = v1;
      ctable[1][4] = (v1-b);

      ctable[2][5] = v2;
      ctable[2][6] = (v2-g);

      f_forbid = ((1-1)^a).toString() + ((1-1)^g).toString();
    }

    // second choice for h
    //

    let s = 0;
    ctable[1][7] = s;
    ctable[1][6] = (b+s)%2;

    s = psum(ctable, 6)%2;
    ctable[0][6] = s;
    ctable[0][1] = (a+s)%2;

    s = psum(ctable, 1)%2;
    ctable[2][1] = s;
    ctable[2][2] = (g+s)%2;

    s = psum(ctable, 2)%2;
    ctable[1][2] = s;
    ctable[1][3] = (b+s)%2;

    s = psum(ctable, 3)%2;
    ctable[0][3] = s;
    ctable[0][4] = (a+s)%2;

    s = psum(ctable, 4)%2;
    ctable[2][4] = s;

    let fin = (g+s)%2;
    let expect_fin = psum(ctable,7)%2;

    let e_ok = ctable[0][4].toString() + ctable[2][4].toString();
    let b_ok = ctable[0][4].toString() + ctable[2][4].toString();

    console.log("\n--- eok:", e_ok, "(!=?", a_forbid, e_ok == a_forbid, ")", "bok:", b_ok, "(!=?", f_forbid, b_ok == f_forbid, ")");
    console.log("H fin:", fin ==  expect_fin, "(", fin, "==", expect_fin, ")");
    console.log(abg,":",a,b,g);

    print_ctable(ctable);
  }

}

function spot_check_notch() {

  let grid = [];
  for (let z=0; z<5; z++) {
    grid.push([]);
    for (let y=0; y<5; y++) {
      grid[z].push([]);
      for (let x=0; x<5; x++) {
        grid[z][y].push(-1);
      }
    }
  }

  let cuboids = [
    { "p": [0,0,0], "s":[2,2,2] },
    { "p": [2,0,0], "s":[3,3,2] },
    { "p": [0,0,2], "s":[3,2,3] },
    { "p": [3,0,2], "s":[2,3,3] },

    { "p": [0,2,0], "s":[2,3,2] },
    //{ "p": [2,3,0], "s":[3,2,3] },
    //{ "p": [3,3,3], "s":[2,2,2] },
    { "p": [0,2,2], "s":[3,3,3] },


  ];

  for (let i=0; i<cuboids.length; i++) {

    let f = Math.random()/8;

    let c = cuboids[i];
    let p = c.p;
    for (let z=0; z<c.s[2]; z++) {
      for (let y=0; y<c.s[1]; y++) {
        for (let x=0; x<c.s[0]; x++) {
          console.log( p[0] + x + f, p[1] + y + f, p[2] + z + f );
        }
      }
    }
  }

}

spot_check_notch();


