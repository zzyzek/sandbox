// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//


FRONTIERQ_VERSION = "0.1.0";
FRONTIERQ_VERBOSE = 0;

function frontierQ() {
  this.reset();
  return this;
};

frontierQ.prototype.reset = function() {

  this.frontier = [];
  this.processed = {};

  this.frontier_bp = {};

  this.state = 0;
  this.msg = "";

  return this;
}

frontierQ.prototype.add = function(v) {

  if (v in this.processed) {
    return this.frontier_bp[v];
  }

  this.processed[v] = 0;

  let idx = this.frontier.length;
  this.frontier.push(v);
  this.frontier_bp[v] = idx;

  return idx;
}

frontierQ.prototype.nxt = function() {
  if (this.frontier.length == 0) {
    this.state = -1;
    this.msg = "nxt underflow";
    return undefined;
  }

  let v = this.frontier.pop();
  this.processed[v] = 1;
  delete this.frontier_bp[v];

  return v;
}

function frontierQ_cli_main() {
  let n_it = 10;

  let fq = new frontierQ();

  for (let ok=0; ok<2; ok++) {

    console.log("----");

    for (let it=0; it<n_it; it++) {
      let v = Math.floor(Math.random()*10);

      console.log("ADD:", v);
      fq.add(v);

    }

    console.log("");

    for (let v=fq.nxt(); (typeof v !== "undefined"); v=fq.nxt()) {
      console.log("GET:", v);
    }

    fq.reset();
  }

  console.log("===");

  for (let i=0; i<5; i++) { fq.add(i); }

  for (let u = fq.nxt(); (typeof u !== "undefined"); u = fq.nxt()) {
    console.log("GET:", u);

    let tv = Math.floor( 10 * Math.random() );
    console.log("  ADD:", tv);
    fq.add(tv);
  }


}

var FRONTIERQ_func_name_map = {
  "frontierQ" : frontierQ
};

function frontierQ_export_f() {
  module.exports = frontierQ;
  //for (let key in FRONTIERQ_func_name_map) {
  //  module.exports[key] = FRONTIERQ_func_name_map[key];
  //}
}

if      (typeof require === "undefined")  { frontierQ_export_f(); }
else if (require.main === module)         { frontierQ_cli_main(process.argv.slice(1)); }
else                                      { frontierQ_export_f(); }


