An AI Strategy for Mathematics
===

###### 2026-11-02

This document is a small editorial describing a
potential path forward to solve larger mathematical
problems using current generation AI agents.

A core mechanic is a loop:

* Generate empirical evidence, through experiment or observation
* Consider theories that provide a compromise of succinct representation
  while giving explanatory and predictive power
* Formalize the theory or refute it

The first step makes a lot of assumptions about what experiment or observation
is and experiment and observation can be made abstract.

To help with larger problems (Millennium problems, etc.), a more specific
strategy can be employed:

* Collect papers from the last 100 years and formalize them
* At each step, within each field and across, observe which methods
  are being used and their similarity
* Collect methods that are re-used verbatim as re-usable libraries
* Collect methods that are similar but slightly different and try
  to create re-usable libraries that have some portion abstracted
  to allow them to be used in different scenarios
* Cross reference different methods to see if they could be used
  to solve problems another way
* Ultimately, create a 'strategy' library that can be used to triage
  problems by whether they can be used by a method or solved by
  one

From personal observation, agents tend to be good at formalization
once "paper-proofs" are laid out.
This can create formalization, in Lean for example, and then
methods can be collected into re-usable components.

The methodology can also be used for open problems:

* Collect a list of open problems, with plenty of smaller, lower
  importance ones in the list
* Triage them by difficulty, seeing whether methods collected from
  the library can be used to solve them outright
* Try to get a "probability of proof" along with a time estimate
  for proof, giving a sort of "Pareto-front" of which ones to
  try first
* For proofs that are successfully proved, collect proof strategies
  along with weights on which worked and which didn't

Proof libraries provide the basis to give an "math atlas",
providing a way to attack larger problems:

* Create a dependency graph, as best one can, that describes
  which result depends on another
* Attack smaller, easier problems that the larger results
  depend on with the library
* Try to generate, as much as possible smaller, easier problems
  that consider an aspect of the larger problem


AI agents continue to improve at an exponential rate,
so the advice given here might be invalidated quickly.

A basic assumption is that there's a ceiling to cognition
and human thought might be at the efficiency limit
for some energy and speed constraints.
This means that whatever future agentic thought might
be, the benefit is one of scale, speed and power efficiency,
not a wholly different way of thinking.
If that's the case, then agents doing math will look very
much like humans doing math but at a larger scale of collaboration
and faster speed.
In such a case, strategies laid out here might still be viable
as the nature of thought won't change, just the scale and speed of it.



