Notes
---

* Q: What is the conformal isomorphism between the complement of the Mandelbrot set and the complement of the unit disk, and how is it constructed?
  - no simple closed form exists, so the best we can hope for is to approximate it
* Bottcher cordinate ([wp](https://en.wikipedia.org/wiki/B%C3%B6ttcher%27s_equation))
* How to apprximate external rays ([wb](https://en.wikibooks.org/wiki/Fractals%2FIterations_in_the_complex_plane%2FMandelbrotSetExterior%2FParameterExternalRay)
* "An introduction to Julia and Fatou sets" by Scott Sutherland

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


$$
\begin{array}{l}
\phi(z) = \left( \lim _ {k \to \infty} f^k(z) \right) ^ {1  / d^k} \\
|\phi(z)| = \left( \lim _ {k \to \infty} |f^k(z) | \right) ^ {1  / d^k} \\
G _ f (z) = \Biggl\\{
 \begin{array}{ll} \log|\phi(z)| & z \notin \mathbf{K} _ f \\
0 & z \in \mathbf{K} _ f \\
\end{array} \\
G _ f(f(z) = d G _ f ( z) \\
\text{Level curves } \to G _ f (z) = \text{constant } > 0 \\
\end{array}
$$


