// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

`use strict`

function IntDisjointSetUnion(n) {
  this.n = n;
  this.parent = [];
  this.rank = [];

  for (let i=0; i<n; i++) {
    this.parent.push(i);
    this.rank.push(0);
  }

  return this;
}

IntDisjointSetUnion.prototype.find = function(x) {
  if ((x < 0) || (x >= this.n)) { return -1; }

  // compress paths as we perform find operation
  //
  if (this.parent[x] != x) {
    this.parent[x] = this.find(this.parent[x]);
  }

  return this.parent[x];
}

IntDisjointSetUnion.prototype.union = function(x, y) {
  if ((x < 0) || (x >= this.n)) { return -1; }
  if ((y < 0) || (y >= this.n)) { return -1; }

  let x_rep = this.find(x);
  let y_rep = this.find(y);

  if (x_rep == y_rep) { return; }

  // merge smaller height to absorb the new disjoint set
  //
  if (this.rank[x_rep] < this.rank[y_rep]) {
    this.parent[x_rep] = y_rep;
  }

  else if (this.rank[x_rep] > this.rank[y_rep]) {
    this.parent[y_rep] = x_rep;
  }

  // ... increasing the height of one of the choices if they're equal
  //
  else {
    this.parent[y_rep] = x_rep;
    this.rank[x_rep] ++;
  }

  return this.parent[x_rep];
}

if (typeof module !== "undefined") {
  module.exports["IntDisjointSetUnion"] = IntDisjointSetUnion;
}
