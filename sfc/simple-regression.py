#!/usr/bin/python3

import math

fn = "./mean_9_14.gp"

data = []

with open(fn, "r") as fp:
  for line in fp:
    line = line.strip()
    if len(line)==0: continue
    if line[0] == '#': continue

    tok = line.split(" ")

    print(tok)
    x = float(tok[0])
    y = float(tok[1])

    data.append([x,y])


def loss(C,mu,data):
  S = 0
  for xy in data:
    x,y = xy
    S += math.pow((C*math.pow(x, mu)) - y, 2)
  return S/len(data)

C_s = 0.01
C_d = 0.005
C_e = 1
C_N = int((C_e - C_s) / C_d)

mu_s = -0.05
mu_d = -0.0025
mu_e = -0.6
mu_N = int((mu_e - mu_s) / mu_d)


err_star = -1
mu_star = mu_s
C_star = C_s
first = True

for iC in range(C_N):
  C = (iC * (C_e - C_s) / C_N) + C_s

  for imu in range(mu_N):

    mu = (imu * (mu_e - mu_s) / mu_N) + mu_s

    if err_star < 0:
      err_star = loss(C,mu,data)
      mu_star = mu
      C_star = C
      print(">>>", C_star, mu_star, "(", err_star, ")")
      continue

    err = loss(C,mu,data)
    if err < err_star:
      err_star = err
      mu_star = mu
      C_star = C
      print(">>>", C_star, mu_star, "(", err_star, ")")


