// JS counterpart of "./gilbert_ep < instances": same output format.
"use strict";
var gep = require("../gilbert_ep.js"), fs = require("fs");
var out = [];
fs.readFileSync(0, "utf8").split("\n").forEach(function (ln) {
  var v = ln.trim().split(/\s+/).map(Number);
  if (v.length !== 6 || v.some(isNaN)) return;
  var r = gep.gilbert_ep(v[0], v[1], v[2], v[3], v[4], v[5]);
  if (r.status !== "ok") { out.push(r.status + ": " + r.reason); return; }
  var h = 2166136261 >>> 0, nd = 0;
  r.path.forEach(function (q, i) {
    if (i > 0 && Math.abs(q[0] - r.path[i-1][0]) === 1 && Math.abs(q[1] - r.path[i-1][1]) === 1) nd++;
    var s = q[0] + " " + q[1] + "\n";
    for (var k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619) >>> 0;
  });
  out.push("ok " + r.path.length + " " + nd + " " + ("00000000" + h.toString(16)).slice(-8));
});
console.log(out.join("\n"));
