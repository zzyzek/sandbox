'use strict';

/******************************************************************************
 * Created 2008-08-19.
 *
 * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
 *
 * Copyright (C) 2008
 *   Wyatt Baldwin <self@wyattbaldwin.com>
 *   All rights reserved
 *
 * Licensed under the MIT license.
 *
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *****************************************************************************/

// ---
//
// modified to return data that information in it, instead of throwing an error.
//
// example usage:
//
//   var graph = {
//     a: {b: 10, d: 1},
//     b: {a: 1, c: 1, e: 1},
//     c: {b: 1, f: 1},
//     d: {a: 1, e: 1, g: 1},
//     e: {b: 1, d: 1, f: 1, h: 1},
//     f: {c: 1, e: 1, i: 1},
//     g: {d: 1, h: 1},
//     h: {e: 1, g: 1, i: 1},
//     i: {f: 1, h: 1}
//   };
//
//   var path_ai = dijkstra.find_path( graph, 'a', 'i');
//   var path_az = dijkstra.find_path( graph, 'a', 'z');
//
// ---
//
// Return:
//
//   "return"       : 0 on success, not 0 on error
//   "msg"          : holds message (e.g. error message)
//   "predecessors" : internal use
//   "path"         : array of path
//   "cost"         : cost value of path
//
// ---

var dijkstra = {

  // straight implementation based of of Floyd-Warshal
  // all pairs shortest path algorithm:
  //
  //   https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
  //
  // returns:
  //
  //  "return"  : 0 on success, non-zero on error
  //  "msg"     : convenience message
  //  "V"       : vertex array list
  //  "dist"    : dict of dicts with shortest cost (vertex to itself is 0)
  //  "prev"    : auxiliary structure for reconstruction
  //
  all_pair_shortest_path: function(graph) {
    let prev = {};
    let dist = {};

    let v_list = [];
    for (let v in graph) {
      v_list.push(v);
      prev[v] = {};
      dist[v] = {};
    }

    for (let v_idx=0; v_idx < v_list.length; v_idx++) {
      let v = v_list[v_idx];

      for (let u_idx=0; u_idx < v_list.length; u_idx++) {
        let u = v_list[u_idx];
        dist[v][u] = undefined;
        prev[v][u] = undefined;
      }

      dist[v][v] = 0;
      prev[v][v] = v;

      for (let u in graph[v]) {
        dist[v][u] = graph[v][u];
        prev[v][u] = v;
      }
    }

    let max_k = v_list.length;

    //for (let k=0; k<v_list.length; k++) {
    for (let k=0; k<max_k; k++) {
      let v_k = v_list[k];
      for (let i=0; i<v_list.length; i++) {
        let v_i = v_list[i];
        for (let j=0; j<v_list.length; j++) {
          let v_j = v_list[j];

          // rhs infinity, regardless of lhs, just skip
          //
          if ((typeof dist[v_i][v_k] === "undefined") ||
              (typeof dist[v_k][v_j] === "undefined")) {
            continue;
          }

          // lhs infinity, rhs valid, so set to rhs
          //
          if (typeof dist[v_i][v_j] === "undefined") {
            dist[v_i][v_j] = dist[v_i][v_k] + dist[v_k][v_j];
            prev[v_i][v_j] = prev[v_k][v_j];
            continue;
          }

          // otherwise, do test
          //
          if (dist[v_i][v_j] > (dist[v_i][v_k] + dist[v_k][v_j])) {
            dist[v_i][v_j] = dist[v_i][v_k] + dist[v_k][v_j];
            prev[v_i][v_j] = prev[v_k][v_j];
          }

        }
      }
    }

    let dist_clean = {};
    let prev_clean = {};
    for (let v_idx=0; v_idx < v_list.length; v_idx++) {
      let v = v_list[v_idx];

      dist_clean[v] = {};
      prev_clean[v] = {};

      for (let u_idx=0; u_idx < v_list.length; u_idx++) {
        let u = v_list[u_idx];

        if (typeof dist[v][u] !== "undefined") {
          dist_clean[v][u] = dist[v][u];
        }

        if (typeof prev[v][u] !== "undefined") {
          prev_clean[v][u] = prev[v][u];
        }

      }
    }

    return { "return": 0, "msg":"", "dist": dist_clean, "prev": prev_clean, "V": v_list };
  },

  // `ctx` is return value from `all_pair_shortest_path` Ffloyd-Warshal algorithm above.
  //
  // returns:
  //
  //  "return"  : 0 on success, non-zero on error
  //  "msg"     : convenience message
  //  "path"    : path from s to d (inclusive) if it exists
  //
  all_pair_shortest_path_reconstruct: function(ctx, s, d) {
    if (!("prev" in ctx)) { return { "return":-1, "msg": "'prev' structure not in context", "path": [] }; }
    if (!("V" in ctx)) { return { "return":-1, "msg": "'V' structure not in context", "path": [] }; }

    let v_list = ctx.V;
    let prev = ctx.prev;

    if (!(s in prev)) { return { "return":-2, "msg": "start vertex not in 'prev' structure", "path":[] }; }
    if (typeof prev[s][d] === "undefined") {
      return { "return":-3, "msg": "no path", "path": [] };
    }

    if (s == d) {
      return { "return": 0, "msg": "", "path": [ s ] };
    }

    let path = [ d ];
    let v = d;
    for (let it=0; it<v_list.length; it++) {

      v = ctx.prev[s][v]
      path.push(v);

      if (v == s) {
        path.reverse();
        return { "return": 0, "msg":"", "path": path };
      }

    }

    return { "return": -5, "msg": "infinite loop", "path": [] };
  },


  single_source_shortest_paths: function(graph, s, d) {
    // Predecessor map for each node that has been encountered.
    // node ID => predecessor node ID
    var predecessors = {};

    // Costs of shortest paths from s to all nodes encountered.
    // node ID => cost
    var costs = {};
    costs[s] = 0;

    // Costs of shortest paths from s to all nodes encountered; differs from
    // `costs` in that it provides easy access to the node that currently has
    // the known shortest path from s.
    // XXX: Do we actually need both `costs` and `open`?
    var open = dijkstra.PriorityQueue.make();
    open.push(s, 0);

    var closest,
        u, v,
        cost_of_s_to_u,
        adjacent_nodes,
        cost_of_e,
        cost_of_s_to_u_plus_cost_of_e,
        cost_of_s_to_v,
        first_visit;
    while (!open.empty()) {
      // In the nodes remaining in graph that have a known cost from s,
      // find the node, u, that currently has the shortest path from s.
      closest = open.pop();
      u = closest.value;
      cost_of_s_to_u = closest.cost;

      // Get nodes adjacent to u...
      adjacent_nodes = graph[u] || {};

      // ...and explore the edges that connect u to those nodes, updating
      // the cost of the shortest paths to any or all of those nodes as
      // necessary. v is the node across the current edge from u.
      for (v in adjacent_nodes) {
        if (adjacent_nodes.hasOwnProperty(v)) {
          // Get the cost of the edge running from u to v.
          cost_of_e = adjacent_nodes[v];

          // Cost of s to u plus the cost of u to v across e--this is *a*
          // cost from s to v that may or may not be less than the current
          // known cost to v.
          cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

          // If we haven't visited v yet OR if the current known cost from s to
          // v is greater than the new cost we just found (cost of s to u plus
          // cost of u to v across e), update v's cost in the cost list and
          // update v's predecessor in the predecessor list (it's now u).
          cost_of_s_to_v = costs[v];
          first_visit = (typeof costs[v] === 'undefined');
          if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
            costs[v] = cost_of_s_to_u_plus_cost_of_e;
            open.push(v, cost_of_s_to_u_plus_cost_of_e);
            predecessors[v] = u;
          }
        }
      }
    }

    if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
      var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
      //throw new Error(msg);
      return { "return" : -1, "msg": msg, "predecessors": [], "path":[], "cost":0 };
    }

    return { "return": 0, "msg":"", "predecessors": predecessors, "path":[], "cost":0 };
  },

  extract_shortest_path_from_predecessor_list: function(predecessors, d) {
    var nodes = [];
    var u = d;
    while (u) {
      nodes.push(u);
      u = predecessors[u];
    }
    nodes.reverse();
    return { "return": 0, "msg":"", "path": nodes, "cost": 0 };
  },

  find_path: function(graph, s, d) {
    //var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
    let info = dijkstra.single_source_shortest_paths(graph, s, d);
    if (info.return != 0) { return info; }
    let predecessors = info.predecessors;
    let path_info = dijkstra.extract_shortest_path_from_predecessor_list(predecessors, d);

    let path = path_info.path;
    for (let i=1; i<path.length; i++) {
      path_info.cost += graph[path[i-1]][path[i]];
    }
    return path_info;
  },



  /**
   * A very naive priority queue implementation.
   */
  PriorityQueueNaive: {
    make: function (opts) {
      var T = dijkstra.PriorityQueue,
          t = {},
          key;
      opts = opts || {};
      for (key in T) {
        if (T.hasOwnProperty(key)) {
          t[key] = T[key];
        }
      }
      t.queue = [];
      t.sorter = opts.sorter || T.default_sorter;
      return t;
    },

    default_sorter: function (a, b) {
      return a.cost - b.cost;
    },

    /**
     * Add a new item to the queue and ensure the highest priority element
     * is at the front of the queue.
     */
    push: function (value, cost) {
      var item = {value: value, cost: cost};
      this.queue.push(item);
      this.queue.sort(this.sorter);
    },

    /**
     * Return the highest priority element in the queue.
     */
    pop: function () {
      return this.queue.shift();
    },

    empty: function () {
      return this.queue.length === 0;
    }
  },



  /**
   * Priority queue implementation.
   */
  PriorityQueue: {
    make: function (opts) {
      var T = dijkstra.PriorityQueue,
          t = {},
          key;
      opts = opts || {};
      for (key in T) {
        if (T.hasOwnProperty(key)) {
          t[key] = T[key];
        }
      }
      t.queue = dijkstra.MinHeap.make(T.default_sorter.bind(t));
      t.priorities = {};
      return t;
    },

    default_sorter: function (a, b) {
      return this.priorities[a] - this.priorities[b];
    },

    /**
     * Add a new item to the queue and ensure the highest priority element
     * is at the front of the queue.
     */
    push: function (value, cost) {
      this.priorities[value] = cost;
      this.queue.insert(value);
    },

    /**
     * Return the highest priority element in the queue.
     */
    pop: function () {
      var next_node_value = this.queue.pop();
      var next_node_cost = this.priorities[next_node_value];
      delete this.priorities[next_node_value];

      var next_node = {
        value: next_node_value,
        cost: next_node_cost
      };
      return next_node;
    },

    empty: function () {
      return this.queue.empty();
    }
  },

  /**
   * Min heap implementation.
   */
  MinHeap: {
    make: function (sorter) {
      var heap = {};
      var minHeap = dijkstra.MinHeap;
      for (var key in minHeap) {
        if (minHeap.hasOwnProperty(key)) {
          heap[key] = minHeap[key];
        }
      } 
      heap.sorter = sorter;
      heap.container = [];

      return heap;
    },
    /**
     * Finding parents or children with indexes.
     */
    get_left_child_index(parent_index) {
      return (2 * parent_index) + 1;
    },
    get_right_child_index(parent_index) {
      return (2 * parent_index) + 2;
    },
    get_parent_index(child_index) {
      return Math.floor((child_index - 1) / 2);
    },
    has_parent(child_index) {
      return this.get_parent_index(child_index) >= 0;
    },
    has_left_child(parent_index) {
      return this.get_left_child_index(parent_index) < this.container.length;
    },
    has_right_child(parent_index) {
      return this.get_right_child_index(parent_index) < this.container.length;
    },
    left_child(parent_index) {
      return this.container[this.get_left_child_index(parent_index)];
    },
    right_child(parent_index) {
      return this.container[this.get_right_child_index(parent_index)];
    },
    parent(child_index) {
      return this.container[this.get_parent_index(child_index)];
    },
    swap(first, second) {
      var tmp = this.container[second];
      this.container[second] = this.container[first];
      this.container[first] = tmp;
    },

    /**
     * Returns element with the highest priority. 
     */
    pop() {
      if (this.container.length === 1) {
        return this.container.pop();
      }
  
      var head_index = 0;
      var last_element = this.container.pop();
      var first_element = this.container[head_index];
  
      this.container[head_index] = last_element;
      this.heapify_down(head_index);
  
      return first_element;
    },  

    insert(value) {
      this.container.push(value);
      this.heapify_up(this.container.length - 1);
    },

    heapify_up(start_index) {
      var current_index = start_index || this.container.length - 1;
  
      while (
        this.has_parent(current_index) && 
        !this.pair_is_in_correct_order(
          this.parent(current_index), 
          this.container[current_index])
      ) {
        this.swap(current_index, this.get_parent_index(current_index));
        current_index = this.get_parent_index(current_index);
      }
    },
    
    heapify_down(start_index = 0) {
      var current_index = start_index;
      var next_index = null;
  
      while (this.has_left_child(current_index)) {
        if (
          this.has_parent(current_index) && 
          this.pair_is_in_correct_order(
            this.right_child(current_index), 
            this.left_child(current_index))
        ) {
          next_index = this.get_right_child_index(current_index);
        } else {
          next_index = this.get_left_child_index(current_index);
        }
  
        if (this.pair_is_in_correct_order(
          this.container[current_index],
          this.container[next_index]
        )) {
          break;
        }
  
        this.swap(current_index, next_index);
        current_index = next_index;
      }
    },
    empty() {
      return this.container.length === 0;
    },
    pair_is_in_correct_order(a, b) {
      return this.sorter(a, b) < 0;
    }
  }

};


// node.js module exports
if (typeof module !== 'undefined') {
  module.exports = dijkstra;
}
