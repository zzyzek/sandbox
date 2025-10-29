Ideas
---

Hilbert Curve Blue Noise
---

###### 2025-10-27

The idea is to use the Hilbert curve's spatial properties to more easily generate blue noise.

* Generate random jumps, $\delta _ k \in [m,M]$, for some mininum, $m$, to some maximum, $M$
* Put a point on the index position $\Delta _ j = \sum _ {k=0}^{j} \delta _ k$ of the Hilbert (Gilbert) curve


Here's rough pseudo-code:

```javascript
let n = w*h;
let A = 5, B = 20;
let T = Math.floor( A + Math.random()*B );
for (let idx = 0; idx < n; idx++) {
  let xy = gilbert_d2xy(idx,w,h);
  if (idx >= T) {
    console.log(xy.x, xy.y, 1);
    T = idx + Math.floor( A + Math.random()*B );
  }
}
```

The requires complete history of all jumps previous, but one could maybe choose a random position
within bins of the index range to make them independent.

With a little more work, one could possibly generate points that have some efficient way to generate
points with minimum distance guarantees, though maybe only in amortized cost.

This is all speculative and one would need to make sure that the distribution matches blue noise (look at
Fourier space to see that there is a hole in the center).

I would imagine there might be some artifacts from the underlying Hilbert curve but maybe they're manageable.


---

OK, it looks like this is well known:

* ["Owen Scrambling Based Blue-Noise Dithered Sampling"](https://psychopath.io/post/2022_07_24_owen_scrambling_based_dithered_blue_noise_sampling)
* ["Hilbert R1 Blue Noise"](https://www.shadertoy.com/view/3tB3z3)
* ["Dithering Comparison"](https://www.shadertoy.com/view/cl2GRm)
