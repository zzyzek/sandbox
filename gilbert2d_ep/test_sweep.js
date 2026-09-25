// Random sizes and endpoints; report status counts, errors and timing.
"use strict";
var gep = require("../gilbert_ep.js");
var seed = +(process.argv[4] || 7); function rnd(n) { seed = (seed + 0x6D2B79F5) | 0; var z = Math.imul(seed ^ (seed >>> 15), 1 | seed); z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z; return (((z ^ (z >>> 14)) >>> 0) % n); }
var K = +process.argv[2], M = +process.argv[3], c = { ok: 0, infeasible: 0, error: 0 }, errs = [], times = [], t0 = Date.now(), ndiag = 0;
for (var i = 0; i < K; i++) {
  var w = 1 + rnd(M), h = 1 + rnd(M), x0 = rnd(w), y0 = rnd(h), x1 = rnd(w), y1 = rnd(h);
  var t1 = Date.now(), r = gep.gilbert_ep(w, h, x0, y0, x1, y1), dt = Date.now() - t1;
  c[r.status]++; times.push([dt, [w,h,x0,y0,x1,y1].join(" ")]);
  if (r.status === "ok" && !gep.compatible(w,h,x0,y0,x1,y1)) ndiag++;
  if (r.status === "error") errs.push([w,h,x0,y0,x1,y1].join(" ") + " " + (gep.compatible(w,h,x0,y0,x1,y1)?"compat":"diag") + " " + r.reason);
}
times.sort(function (a, b) { return b[0] - a[0]; });
console.log(JSON.stringify(c), "ok with diagonal:", ndiag, "total s", (Date.now()-t0)/1000);
console.log("slowest:", times.slice(0,5).map(function (t) { return t[0] + "ms (" + t[1] + ")"; }).join(", "));
errs.forEach(function (e) { console.log("  " + e); });
