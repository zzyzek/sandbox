// Compare gilbert_ep against brute-force ground truth.
"use strict";
var gep = require("../gilbert_ep.js"), fs = require("fs");
var L = fs.readFileSync(process.argv[2], "utf8").trim().split("\n");
var c = { both: 0, none: 0, miss: 0, bogus: 0 }, miss = [];
L.forEach(function (ln) {
  var f = ln.split(" "), v = f.slice(0, 6).map(Number), feas = (f[6] === "feasible");
  var r = gep.gilbert_ep(v[0], v[1], v[2], v[3], v[4], v[5]), ok = (r.status === "ok");
  if (feas && ok) c.both++; else if (!feas && !ok) c.none++; else if (feas) { c.miss++; miss.push(ln + " -> " + r.status + " " + r.reason); } else c.bogus++;
});
console.log(JSON.stringify(c)); miss.slice(0, 20).forEach(function (m) { console.log("  " + m); });
