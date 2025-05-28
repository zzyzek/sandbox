#!/usr/bin/python3

# differential heatmap visualization
# 

import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.colors as colors
import numpy as np
import sys
import os
from natsort import  natsorted, ns

import time

data_set = []

Nx = 128
Ny = 128

num_frames = len(os.listdir("data/"))
num_frames = 0

FNS = os.listdir("data/")
FNS = natsorted(FNS)

fns = []
dfn = int(len(FNS)/60)
for idx in range(0,len(FNS),dfn):
  fns.append(FNS[idx])

_min_val = 3.0
_max_val = -1.0

#DEBUG_COUNT_MAX = 3
#DEBUG_COUNT = 0

for fn in fns:

  if len(fn)==0: continue
  if fn[0] == '.': continue

  fqfn = "data/" + fn
  print(fqfn)

  num_frames += 1

  #data = []
  #for y in range(Ny):
  #  data.append([])
  #  for x in range(Nx):
  #    data[y].append(0.0)

  uniq_x = {}
  uniq_y = {}

  uniq_x_count = 0
  uniq_y_count = 0

  #data = []
  #cur_data_x = 0
  #cur_data_y = 0

  with open(fqfn, "r") as fp:
    lines = fp.readlines()

    data_list = []

    #print("#cp.0:" , str(int(round(time.time()*1000))))

    for line in lines:
      line = line.strip()
      if len(line)==0: continue
      if line[0]=='#': continue
      tok = line.split(" ")
      if len(tok)!=3: continue

      if not (tok[0] in uniq_x):
        uniq_x[tok[0]] = 1
        uniq_x_count+=1

      if not (tok[1] in uniq_y):
        uniq_y[tok[1]] = 1
        uniq_y_count+=1

    #print("#cp.1:" , str(int(round(time.time()*1000))))

    data = []
    for y in range(uniq_y_count):
      data.append([])
      for x in range(uniq_x_count):
        data[y].append(0.0)

    #print("#cp.2:" , str(int(round(time.time()*1000))))


    #for xyz in data_list:
    for line in lines:
      #x,y,z = xyz
      line = line.strip()
      if len(line)==0: continue
      if line[0]=='#': continue
      tok = line.split(" ")
      if len(tok)!=3: continue

      x = float(tok[0])
      y = float(tok[1])
      z = float(tok[2])

      ix = int(x * uniq_x_count)
      iy = int(y * uniq_y_count)

      if _max_val < z: _max_val = z
      if _min_val > z: _min_val = z

      data[iy][ix] = z

      #print(ix,iy,x,y,z)

    #print("#cp.3:" , str(int(round(time.time()*1000))))

    data_set.append(data)

    #print("#cp.4:" , str(int(round(time.time()*1000))))

  #DEBUG_COUNT += 1
  #if DEBUG_COUNT >= DEBUG_COUNT_MAX: break


fig, ax = plt.subplots()
heatmap = ax.imshow(data_set[0], cmap='viridis', animated=True,
                    norm=colors.SymLogNorm(linthresh=1, vmin=_min_val, vmax=_max_val, base=10) )
fig.colorbar(heatmap)

def animate(frame_num):
    data = data_set[frame_num]
    heatmap.set_array(data)
    ax.set_title(f"Frame: {frame_num} ({fns[frame_num]})")
    return heatmap,

ani = animation.FuncAnimation(fig,
                              animate,
                              frames=num_frames,
                              interval=200,
                              blit=False,
                              repeat=True)

# Save animation
#
ani.save('anim.gif', writer='pillow')

plt.show()
