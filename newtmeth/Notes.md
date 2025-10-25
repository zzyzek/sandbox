Notes
---

* Q: What is the conformal isomorphism between the complement of the Mandelbrot set and the complement of the unit disk, and how is it constructed?
  - no simple closed form exists, so the best we can hope for is to approximate it
* Bottcher cordinate ([wp](https://en.wikipedia.org/wiki/B%C3%B6ttcher%27s_equation))
* How to apprximate external rays ([wb](https://en.wikibooks.org/wiki/Fractals%2FIterations_in_the_complex_plane%2FMandelbrotSetExterior%2FParameterExternalRay)

???

$$
\begin{array}{l}
f _ c (z) = z^2  + c \\
g(c) = \lim _ {n \to \infty} \frac{1}{2^n} \log | z _ n |, c \notin M \\
\text{Take } R >> 1 (\text{e.g. } 10^2), |z _ n| > R \\
g(c) \approx \frac{1}{2^n} \log|z _ n| \\
\to |\phi(c)| = e^{g(c)}, \{ g(c) = \text{const} \}  \\
\end{array}
$$
