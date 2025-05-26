#!/usr/bin/python3

# differential heatmap visualization
# 

import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.colors as colors
import numpy as np
import sys
import os

data_set = []

Nx = 128
Ny = 128

num_frames = len(os.listdir("data/"))
num_frames = 0

fns = os.listdir("data/")
fns.sort()

_min_val = 3.0
_max_val = -1.0


for fn in fns:

  if len(fn)==0: continue
  if fn[0] == '.': continue

  fqfn = "data/" + fn
  print(fqfn)

  num_frames += 1

  data = []
  for y in range(Ny):
    data.append([])
    for x in range(Nx):
      data[y].append(0.0)

  with open(fqfn, "r") as fp:
    lines = fp.readlines()
    for line in lines:
      line = line.strip()
      if len(line)==0: continue
      if line[0]=='#': continue
      tok = line.split(" ")
      if len(tok)!=3: continue

      x = float(tok[0])
      y = float(tok[1])
      z = float(tok[2])

      if z < _min_val: _min_val = z
      if z > _max_val: _max_val = z

      ix = int(x * Nx)
      iy = int(y * Ny)

      if (ix < 0) or (ix >= Nx) or (iy < 0) or (iy >= Ny): continue

      data[iy][ix] = z

  data_set.append(data)


fig, ax = plt.subplots()
heatmap = ax.imshow(data_set[0], cmap='viridis', animated=True,
                    norm=colors.SymLogNorm(linthresh=1, vmin=_min_val, vmax=_max_val, base=10) )
fig.colorbar(heatmap)

def animate(frame_num):
    data = data_set[frame_num]
    heatmap.set_array(data)
    ax.set_title(f"Frame: {frame_num}")
    return heatmap,

ani = animation.FuncAnimation(fig,
                              animate,
                              frames=num_frames,
                              interval=25,
                              blit=False,
                              repeat=True)

# Save animation
# ani.save('animated_heatmap.gif', writer='pillow') # Ensure Pillow is installed

plt.show()
