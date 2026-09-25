// Compare gilbert_ep against gilbert2d for corner endpoints.
"use strict";
var gep = require("../gilbert_ep.js"), fs = require("fs");
var lines = fs.readFileSync(process.argv[2], "utf8").trim().split("\n");
var ok = 0, bad = 0, refbad = 0;
lines.forEach(function (ln) {
  var o = JSON.parse(ln);
  // skip references that are not valid orthogonal paths ending at t
  var P = o.path, last = P[P.length-1];
  var valid = (last[0] === o.t[0]) && (last[1] === o.t[1]);
  for (var i = 1; i < P.length; i++) { if ((Math.abs(P[i][0]-P[i-1][0]) + Math.abs(P[i][1]-P[i-1][1])) !== 1) { valid = false; } }
  if (!valid) { refbad++; return; }
  var r = gep.gilbert_ep(o.w, o.h, o.s[0], o.s[1], o.t[0], o.t[1]);
  if ((r.status === "ok") && (JSON.stringify(r.path) === JSON.stringify(P))) { ok++; }
  else { bad++; if (bad < 10) { console.log("MISMATCH", o.w, o.h, o.s, o.t, r.status, r.reason || ""); } }
});
console.log("identical:", ok, "different:", bad, "reference not a valid s-t path:", refbad);
