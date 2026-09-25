"use strict";
var gep = require("../gilbert_ep.js");
var seed = 99; function rnd(n) { seed = (seed + 0x6D2B79F5) | 0; var z = Math.imul(seed ^ (seed >>> 15), 1 | seed); z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z; return (((z ^ (z >>> 14)) >>> 0) % n); }
var c = { ok: 0, infeasible: 0, error: 0 }, errs = [], worst = [0, ""], t0 = Date.now();
for (var i = 0; i < 3000; i++) {
  var a = 2 + rnd(13), b = 10 + rnd(150), w = (i & 1) ? a : b, h = (i & 1) ? b : a;
  var x0 = rnd(w), y0 = rnd(h), x1 = rnd(w), y1 = rnd(h);
  var t1 = Date.now(), r = gep.gilbert_ep(w, h, x0, y0, x1, y1), dt = Date.now() - t1;
  c[r.status]++; if (dt > worst[0]) worst = [dt, [w,h,x0,y0,x1,y1].join(" ")];
  if (r.status === "error") errs.push([w,h,x0,y0,x1,y1].join(" ") + " " + (gep.compatible(w,h,x0,y0,x1,y1)?"compat":"diag") + " " + r.reason);
}
console.log(JSON.stringify(c), "s", (Date.now()-t0)/1000, "worst", worst[0] + "ms (" + worst[1] + ")");
errs.forEach(function (e) { console.log("  " + e); });
