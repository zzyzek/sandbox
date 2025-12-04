Submission for Paged Out
===

* [Breakout Model Synthesis (PDF)](https://github.com/zzyzek/sandbox/blob/main/paged-out/PO_BMS.pdf)

[Paged Out](https://pagedout.institute/) is an online technical magazine that published short (one-page)
articles in a magazine like format (PDF).

They have a general [call for pages](https://pagedout.institute/?page=cfp.php).

This directory is my submission (2025-12-03).

Compilation
---

```
./cmp.sh
```

To check spelling:

```
./run-aspell
```

Note the presence of a `jargon.txt` file.

Notes
---

* [Using colors in LaTeX](https://www.overleaf.com/learn/latex/Using_colors_in_LaTeX)
* [using bold italic text inside listing](https://tex.stackexchange.com/questions/27663/using-bold-italic-text-inside-listings)
* [listings LaTeX package documentation](https://texdoc.org/serve/listings/0)
* [Overleaf documentation on Code listing (LaTeX)](https://www.overleaf.com/learn/latex/Code_listing)
* [Paged Out article templates](https://pagedout.institute/?page=writing.php#templates)

Creating Graphics From Tilesets
---

[Punch Out Model Synthesis](https://github.com/zzyzek/PunchOutModelSynthesis) (POMS) is an algorithm that extends Breakout Model Synthesis
to work on larger maps by only working on blocks at a time without keeping the whole grid state in memory.
POMS implements Breakout Model Synthesis (BMS) as it's block level solver.
This means that using the POMS program with a grid size (aka "quilt") the same size as the block size will effectively run BMS
on the problem instance.

For completeness, the parameters that were used to generate the pictures in the article are located in the `runs/` directory here.
The `runs/` directory from the POMS repository was used as a template to create the runs here.

Note that the `poms` binary will be needed to run these examples.

The POMS config files were created separately and taken as input here. See the `init.sh` in the appropriate `runs/` subdirectory in
the POMS repository.

All examples were run with:

```
poms bin version: 0.18.0
poms lib version: 0.24.0
```

### Example Run

Here is an example run for the *Pill Mortal* tileset:

```
cd runs/po_pillmortal
./paged-out-pm48
tiled po_pm_48x48.json
```

Note that the *Pill Mortal* run has "snapshots" created at each iteration to be able to create the "fog of war" illustrations
for the first figure.
That is, each iteration creates a (valid) Tiled JSON file that will render using Tiled but has an extra layer with tile
count remaining on a cell-by-cell basis.
Maybe there's a way to shoehorn a fog-of-war like visualization in Tiled but I created my own viewer to use the tile count
information.
For the brave, there's limited documentation in [POMS/doc/viz/viewer2d](https://github.com/zzyzek/PunchOutModelSynthesis/tree/main/doc/viz/viewer2d).

The remaining four are all straight forward runs, producing a small Tiled JSON file.
The PNG images can be exported using Tiled.

License
---

Unless otherwise stated, all content in this directory is under a CC0 license.

Tileset Locations and Licenses
---

* Pill Mortal - CC0 (Z. Zzyzek) ([POMS](https://github.com/zzyzek/PunchOutModelSynthesis))
* 1985 by Adam Atomic - public domain (Adam Saltsman) ([itch.io](https://adamatomic.itch.io/1985))
* Overhead Action RPG Overworld by LUNARSIGNALS - CC-BY-SA3.0 ([OGA](https://opengameart.org/content/overhead-action-rpg-overworld))
* 8-color roguelike assets 8x8 by Kingel - CC-BY-SA ([tigsource](https://forums.tigsource.com/index.php?topic=14166.0))
* 2Bit Micro Metroidvania Tilset by 0x72 - CC0 ([itch.io](https://0x72.itch.io/2bitmicrometroidvaniatileset))

###### 2025-12-03
