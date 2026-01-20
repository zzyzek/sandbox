
var fs = require("fs");

let txt = fs.readFileSync("Maxima_of_a_point_set.svg", 'utf8');

// taken from inspection
//
let N = 378;

let lines = txt.split("\n");
for (let line_no=0; line_no < lines.length; line_no++) {
  let line = lines[line_no];


  if (line.search( /<circle /) < 0) { continue; }

  let _mx = line.match( /cx="(\d+)"/ );
  let cx = parseInt(_mx[1]);

  let _my = line.match( /cy="(\d+)"/ );
  let cy = parseInt(_my[1]);

  let x = cx / N;
  let y = (N - cy) / N;

  console.log(x,y);


}

