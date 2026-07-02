#!/usr/bin/python3
#
# To the extent possible under law, the person who associated CC0 with
# this project has waived all copyright and related or neighboring rights
# to this project.
# 
# You should have received a copy of the CC0 legalcode along with this
# work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
#

# Trying to implement note 2026-06-30
#

import sys, os
import math
import random

random.seed(1337)

def fisher_yates(a):
  n = len(a)
  for i in range(n-1):
    idx = random.randrange(i,n)
    t = a[i]
    a[i] = a[idx]
    a[idx] = t
  return a


Pr = [
  2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,
  73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,
  179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,
  283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,
  419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,
  547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,
  661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,
  811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,
  947,953,967,971,977,983,991,997,1009,1013,1019,1021,1031,1033,1039,1049,1051,1061,1063,1069,
  1087,1091,1093,1097,1103,1109,1117,1123,1129,1151,1153,1163,1171,1181,1187,1193,1201,1213,1217,1223,
  1229,1231,1237,1249,1259,1277,1279,1283,1289,1291,1297,1301,1303,1307,1319,1321,1327,1361,1367,1373,
  1381,1399,1409,1423,1427,1429,1433,1439,1447,1451,1453,1459,1471,1481,1483,1487,1489,1493,1499,1511,
  1523,1531,1543,1549,1553,1559,1567,1571,1579,1583,1597,1601,1607,1609,1613,1619,1621,1627,1637,1657,
  1663,1667,1669,1693,1697,1699,1709,1721,1723,1733,1741,1747,1753,1759,1777,1783,1787,1789,1801,1811,
  1823,1831,1847,1861,1867,1871,1873,1877,1879,1889,1901,1907,1913,1931,1933,1949,1951,1973,1979,1987,
  1993,1997,1999,2003,2011,2017,2027,2029,2039,2053,2063,2069,2081,2083,2087,2089,2099,2111,2113,2129,
  2131,2137,2141,2143,2153,2161,2179,2203,2207,2213,2221,2237,2239,2243,2251,2267,2269,2273,2281,2287,
  2293,2297,2309,2311,2333,2339,2341,2347,2351,2357,2371,2377,2381,2383,2389,2393,2399,2411,2417,2423,
  2437,2441,2447,2459,2467,2473,2477,2503,2521,2531,2539,2543,2549,2551,2557,2579,2591,2593,2609,2617,
  2621,2633,2647,2657,2659,2663,2671,2677,2683,2687,2689,2693,2699,2707,2711,2713,2719,2729,2731,2741,
  2749,2753,2767,2777,2789,2791,2797,2801,2803,2819,2833,2837,2843,2851,2857,2861,2879,2887,2897,2903,
  2909,2917,2927,2939,2953,2957,2963,2969,2971,2999,3001,3011,3019,3023,3037,3041,3049,3061,3067,3079,
  3083,3089,3109,3119,3121,3137,3163,3167,3169,3181,3187,3191,3203,3209,3217,3221,3229,3251,3253,3257,
  3259,3271,3299,3301,3307,3313,3319,3323,3329,3331,3343,3347,3359,3361,3371,3373,3389,3391,3407,3413,
  3433,3449,3457,3461,3463,3467,3469,3491,3499,3511,3517,3527,3529,3533,3539,3541,3547,3557,3559,3571,
  3581,3583,3593,3607,3613,3617,3623,3631,3637,3643,3659,3671,3673,3677,3691,3697,3701,3709,3719,3727,
  3733,3739,3761,3767,3769,3779,3793,3797,3803,3821,3823,3833,3847,3851,3853,3863,3877,3881,3889,3907,
  3911,3917,3919,3923,3929,3931,3943,3947,3967,3989,4001,4003,4007,4013,4019,4021,4027,4049,4051,4057,
  4073,4079,4091,4093,4099,4111,4127,4129,4133,4139,4153,4157,4159,4177,4201,4211,4217,4219,4229,4231,
  4241,4243,4253,4259,4261,4271,4273,4283,4289,4297,4327,4337,4339,4349,4357,4363,4373,4391,4397,4409,
  4421,4423,4441,4447,4451,4457,4463,4481,4483,4493,4507,4513,4517,4519,4523,4547,4549,4561,4567,4583,
  4591,4597,4603,4621,4637,4639,4643,4649,4651,4657,4663,4673,4679,4691,4703,4721,4723,4729,4733,4751,
  4759,4783,4787,4789,4793,4799,4801,4813,4817,4831,4861,4871,4877,4889,4903,4909,4919,4931,4933,4937,
  4943,4951,4957,4967,4969,4973,4987,4993,4999,5003,5009,5011,5021,5023,5039,5051,5059,5077,5081,5087,
  5099,5101,5107,5113,5119,5147,5153,5167,5171,5179,5189,5197,5209,5227,5231,5233,5237,5261,5273,5279,
  5281,5297,5303,5309,5323,5333,5347,5351,5381,5387,5393,5399,5407,5413,5417,5419,5431,5437,5441,5443,
  5449,5471,5477,5479,5483,5501,5503,5507,5519,5521,5527,5531,5557,5563,5569,5573,5581,5591,5623,5639,
  5641,5647,5651,5653,5657,5659,5669,5683,5689,5693,5701,5711,5717,5737,5741,5743,5749,5779,5783,5791,
  5801,5807,5813,5821,5827,5839,5843,5849,5851,5857,5861,5867,5869,5879,5881,5897,5903,5923,5927,5939,
  5953,5981,5987,6007,6011,6029,6037,6043,6047,6053,6067,6073,6079,6089,6091,6101,6113,6121,6131,6133,
  6143,6151,6163,6173,6197,6199,6203,6211,6217,6221,6229,6247,6257,6263,6269,6271,6277,6287,6299,6301,
  6311,6317,6323,6329,6337,6343,6353,6359,6361,6367,6373,6379,6389,6397,6421,6427,6449,6451,6469,6473,
  6481,6491,6521,6529,6547,6551,6553,6563,6569,6571,6577,6581,6599,6607,6619,6637,6653,6659,6661,6673,
  6679,6689,6691,6701,6703,6709,6719,6733,6737,6761,6763,6779,6781,6791,6793,6803,6823,6827,6829,6833,
  6841,6857,6863,6869,6871,6883,6899,6907,6911,6917,6947,6949,6959,6961,6967,6971,6977,6983,6991,6997,
  7001,7013,7019,7027,7039,7043,7057,7069,7079,7103,7109,7121,7127,7129,7151,7159,7177,7187,7193,7207,
  7211,7213,7219,7229,7237,7243,7247,7253,7283,7297,7307,7309,7321,7331,7333,7349,7351,7369,7393,7411,
  7417,7433,7451,7457,7459,7477,7481,7487,7489,7499,7507,7517,7523,7529,7537,7541,7547,7549,7559,7561,
  7573,7577,7583,7589,7591,7603,7607,7621,7639,7643,7649,7669,7673,7681,7687,7691,7699,7703,7717,7723,
  7727,7741,7753,7757,7759,7789,7793,7817,7823,7829,7841,7853,7867,7873,7877,7879,7883,7901,7907,7919]

DEBUG = 1
PRINT_PARTITION = False

eznpp_ctx = {
  "n": -1,
  "m": -1,
  "M": -1,

  # window size factor ( w_k = alpha * lg(p_k) )
  #
  "alpha": 1.5,

  # cluster cover factor ( L = beta * n)
  # eta_k = ceil( L / w_k ) (eta_k == number of clusters for prime k)
  #
  "beta": 2,

  # 'duplication length' (L = beta * n)
  #
  "L": -1,

  # npp instance
  #
  "a": [],

  # prime list
  #
  "p": [],

  # cluster size for each prime
  #
  "w": [],

  "cluster_idx" : [],
  "cluster_s": [],

  # number of clusters for each prime
  #
  "eta": [],

  # center of score function
  #
  "mu": [],

  # rescale of score function
  #
  "gamma": [],

  "Q": []
}

def eznpp_debug_print(ctx):

  fold = 8

  print("n:", ctx["n"], "M:", ctx["M"], "(m:", ctx["m"], ")")
  print("alpha:", ctx["alpha"], "beta:", ctx["beta"], "L:", ctx["L"])

  pfx = "a[" + str(len(ctx["a"])) + "]: "
  pfx_len = len(pfx)

  line = []
  for i in range(len(ctx["a"])):
    if (i>0) and ((i%fold)==0):
      print( pfx + " ".join(line) )
      line = []
      pfx = " "*pfx_len
    line.append( str(ctx["a"][i]) )
  if len(line) > 0:
    print( pfx + " ".join(line) )
    line = []

  pfx = "p[" + str(len(ctx["p"])) + "]: "
  pfx_len = len(pfx)

  for i in range(len(ctx["p"])):
    if (i>0) and ((i%fold)==0):
      print( pfx + " ".join(line) )
      line = []
      pfx = " "*pfx_len
    line.append( str(ctx["p"][i]) )
  if len(line) > 0:
    print( pfx + " ".join(line) )
    line = []


  print( "Q[" + str(len(ctx["p"])) + "][" + str(len(ctx["a"])) + "]:")


  for p_idx in range(len(ctx["Q"])):

    #pfx = "  " + str(p_idx) + "{" + str(ctx["p"][p_idx]) + "}:"
    pfx = "  {" + str(ctx["p"][p_idx]) + "}:"

    line = [ pfx ]
    for a_idx in range(len(ctx["Q"][p_idx])):
      line.append( str(ctx["Q"][p_idx][a_idx]) )

    print( " ".join(line) )


  print("w:", ctx["w"])
  print("eta:", ctx["eta"])

  for p_idx in range(len(ctx["p"])):

    pr = ctx["p"][p_idx]

    p_cluster_size = ctx["w"][p_idx]

    print("cluster{", pr, "}[" + str(len(ctx["cluster_idx"][p_idx])) + "]:", eznpp_p_cluster_score(ctx, p_idx) )

    for c_idx in range(len(ctx["cluster_idx"][p_idx])):

      s_global = []

      line = [ "  " ]
      for i in range(len( ctx["cluster_idx"][p_idx][c_idx] )):
        idx = ctx["cluster_idx"][p_idx][c_idx][i]
        s = ctx["cluster_s"][p_idx][c_idx][i]
        v = ctx["Q"][p_idx][ idx ]

        s_global.append( ctx["s"][idx] )

        _s = ""
        if s == -1: _s = "-"
        else: _s = "+"

        line.append( _s + str(v) + "{idx:" + str(idx) + "}" )

      #_d = _dot( s_global, ctx["cluster_s"][p_idx][c_idx] )
      _d = _simcount( s_global, ctx["cluster_s"][p_idx][c_idx] )

      _match = 0
      if _d == p_cluster_size: _match = 1

      print( " ".join(line)  + "  <match:" + str(_match) + "," + str(_d) + "/" + str(p_cluster_size) + ">")

  print("tot_score:", eznpp_tot_score(ctx))

def eznpp_p_cluster_match_count(ctx, p_idx):

  p_cluster_size = ctx["w"][p_idx]
  p_n_cluster = len(ctx["cluster_idx"][p_idx])

  match_count = 0
  for c_idx in range(len(ctx["cluster_idx"][p_idx])):

    s_global = []
    for i in range(len(ctx["cluster_idx"][p_idx][c_idx])):
      idx = ctx["cluster_idx"][p_idx][c_idx][i]
      s = ctx["cluster_s"][p_idx][c_idx][i]
      v = ctx["Q"][p_idx][ idx ]

      s_global.append( ctx["s"][idx] )

    _d = _simcount( s_global, ctx["cluster_s"][p_idx][c_idx] )
    if _d == p_cluster_size: match_count += 1

  return [match_count, p_n_cluster ]

def eznpp_p_cluster_score(ctx, p_idx):

  p_cluster_size = ctx["w"][p_idx]
  p_n_cluster = len(ctx["cluster_idx"][p_idx])

  match_count = 0
  for c_idx in range(len(ctx["cluster_idx"][p_idx])):

    s_global = []
    for i in range(len(ctx["cluster_idx"][p_idx][c_idx])):
      idx = ctx["cluster_idx"][p_idx][c_idx][i]
      s = ctx["cluster_s"][p_idx][c_idx][i]
      v = ctx["Q"][p_idx][ idx ]

      s_global.append( ctx["s"][idx] )

    _d = _simcount( s_global, ctx["cluster_s"][p_idx][c_idx] )
    if _d == p_cluster_size: match_count += 1

  x = float(match_count) / float(p_n_cluster)
  y = _sigmoid( 3.0*(x-0.5) )
  return y

def eznpp_tot_score(ctx):
  p_n = len(ctx["p"])
  S = 0
  for p_idx in range(p_n):
    S += eznpp_p_cluster_score(ctx, p_idx)
  return float(S) / float(p_n)

def _dot(a,b):
  s = 0
  for i in range(len(a)): s += a[i]*b[i]
  return s

def _simcount(a,b):
  s = 0
  for i in range(len(a)):
    if a[i]==b[i]: s+=1
  return s

def _sigmoid(x):
  return 1.0 / (1.0 + math.exp(-x))

def simpsolve(A,S, idx):
  if idx == len(S): return _dot(A,S)
  S[idx] = 1
  v = simpsolve(A,S,idx+1)
  if v==0: return v
  S[idx] = -1
  v = simpsolve(A,S,idx+1)
  if v==0: return v
  return -1


def npp_modp_brute_force(a, s, p, idx):
  if idx == len(a):
    v = 0
    for i in range(len(a)):
      v += a[i]*s[i]
    v = ((v%p) + p)%p
    if v == 0: return True
    return False

  s0 = 0
  if random.randrange(2) == 0: s0 = -1
  else: s0 = 1

  s[idx] = s0
  r = npp_modp_brute_force(a,s,p, idx+1)
  if r: return r

  s[idx] = -s0
  r = npp_modp_brute_force(a,s,p, idx+1)
  return r

def __spottest_npp_modp_brute_force():
  test_a = [ 10, 5, 10, 3, 0, 4, 5, 9, 2, 10 ]
  test_s = [ 0 , 0,  0, 0, 0, 0, 0, 0, 0, 0 ]
  test_p = 11
  test_r = npp_modp_brute_force(test_a, test_s, test_p, 0)
  print(test_r, test_s)
  for i in range(len(test_s)):
    print( test_s[i], '*', test_a[i] )

def eznpp_setup(ctx, n, m, alpha=1.5, beta=4.0):
  ctx["n"] = n
  ctx["m"] = m
  ctx["M"] = 1<<m

  ctx["alpha"] = alpha
  ctx["beta"] = beta
  ctx["L"] = math.ceil( beta * n )

  ctx["a"] = []

  ctx["s"] = []

  # construct A instance
  #
  for i in range(n):
    ctx["a"].append( random.randrange(1, 1<<m) )

    s = 0
    if random.randrange(2) == 0: s = -1
    else: s = 1

    ctx["s"].append( s )
  if ((sum(ctx["a"]) % 2) == 1): ctx["a"][0] += 1

  S = sum(ctx["a"])

  # find chinese remainder theorem (CRT) primes
  #
  ctx["p"] = []
  p_idx = 1
  B = 1
  while B < S:
    B *= Pr[p_idx]
    ctx["p"].append(Pr[p_idx])
    p_idx+=1

  # create CRT vectors
  #
  ctx["Q"] = []
  for p_idx, pr in enumerate(ctx["p"]):
    ctx["Q"].append([])
    for a_k in ctx["a"]:
      ctx["Q"][p_idx].append( a_k % pr )

  
  # number of clusters for each prime
  #

  I = []
  for i in range( len(ctx["a"]) ): I.append(i)

  # create 'cluster' sub-solutions and aux information
  #
  ctx["w"] = []
  ctx["eta"] = []
  ctx["cluster_idx"] = []
  ctx["cluster_s"] = []
  for p_idx in range(len(ctx["p"])):
    p_cluster_size = math.ceil( ctx["alpha"] * math.log( ctx["p"][p_idx] ) / math.log(2.0) )
    ctx["w"].append( p_cluster_size )

    p_n_cluster = math.ceil( ctx["L"] / p_cluster_size )

    ctx["eta"].append( p_n_cluster )

    ctx["cluster_idx"].append([])
    ctx["cluster_s"].append([])

    for c_idx in range(p_n_cluster):
      fisher_yates(I)

      _a_idx = []
      _a_val = []
      _a_s = []
      for i in range(p_cluster_size):
        _a_idx.append( I[i] )
        _a_val.append( ctx["Q"][p_idx][ I[i] ] )
        _a_s.append(0)

      res = npp_modp_brute_force(_a_val, _a_s, ctx["p"][p_idx], 0)
      if res:
        ctx["cluster_idx"][p_idx].append( _a_idx )
        ctx["cluster_s"][p_idx].append( _a_s )

  return ctx


def eznpp_iter0(ctx):

  n_it = 100000

  n = ctx["n"]
  p_n = len(ctx["p"])

  for it in range(n_it):
    score_prv = eznpp_tot_score(ctx)



    line = []
    for p_idx in range(len(ctx["p"])):
      cn = eznpp_p_cluster_match_count(ctx, p_idx)
      line.append( str(cn[0]) + "/" + str(cn[1]))

    print("#it:", it, "/", n_it, " score:", score_prv, "(", " ".join(line), ")" )

    p_choice = random.randrange(p_n)
    c_choice = random.randrange( len(ctx["cluster_idx"][p_choice]) )

    s_prv = []

    s_idx = []
    s_val = []

    for i in range( len(ctx["cluster_idx"][p_choice][c_choice]) ):

      _idx = ctx["cluster_idx"][p_choice][c_choice][i]
      _s = ctx["cluster_s"][p_choice][c_choice][i]

      s_idx.append(_idx)
      s_val.append(_s)

      s_prv.append( ctx["s"][_idx] )
      ctx["s"][_idx] = _s



    #s_idx = random.randrange(n)
    #s_val = ctx["s"]
    #ctx["s"][s_idx] *= -1

    score_nxt = eznpp_tot_score(ctx)

    if score_nxt > score_prv:
      continue

    if random.randrange(1000) < 30:
      continue

    #ctx["s"][s_idx] *= -1

    for i in range( len(s_idx) ):
      _idx = s_idx[i]
      ctx["s"][_idx] = s_prv[i]

def eznpp_raw(ctx):
  n = ctx["n"]
  S = 0
  for idx in range(n):
    S += ctx["s"][idx] * ctx["a"][idx]
  return S

def eznpp_p_raw(ctx, p_idx):
  n = ctx["n"]
  pr = ctx["p"][p_idx]
  S = 0
  for idx in range(n):
    S += ctx["s"][idx] * ctx["Q"][p_idx][idx]
  return S % pr

def eznpp_occ_score(ctx):

  n = ctx["n"]
  m = ctx["m"]
  n_p = len(ctx["p"])

  tot_occ_count = [0]*n_p

  for p_idx in range(n_p):

    p_occ = [0]*n
    p_occ_count = 0

    for c_idx in range( len(ctx["cluster_idx"][p_idx]) ):

      c_n = len(ctx["cluster_idx"][p_idx][c_idx])

      print("p_idx:", p_idx, "c_idx:", c_idx, "c_n:", c_n, "(p raw score:", eznpp_p_raw(ctx,p_idx), ")")
      print("  s:", ctx["s"])
      print("  a:", ctx["a"])
      print("  b:", ctx["Q"][p_idx])

      s_sim_count = 0
      for pos in range( c_n ):
        s_idx = ctx["cluster_idx"][p_idx][c_idx][pos]
        s_val = ctx["cluster_s"][p_idx][c_idx][pos]

        print("  cmp s_val:", s_val, "==? s[", s_idx, "]:", ctx["s"][s_idx])


        if s_val == ctx["s"][s_idx]:

          print("    yep")

          s_sim_count += 1

        else:
          print("    nope")

      print("  s_sim_count:", s_sim_count, "/", c_n, "?")

      if s_sim_count == c_n:

        print("  ADDING occupancy, was:", p_occ)

        for pos in range( c_n ):
          s_idx = ctx["cluster_idx"][p_idx][c_idx][pos]
          s_val = ctx["cluster_s"][p_idx][c_idx][pos]

          if p_occ[s_idx] == 0: p_occ_count += 1
          p_occ[s_idx] = 1

        print("  NOW:", p_occ)

    print("tot_occ_count[", p_idx, "]:", p_occ_count)

    tot_occ_count[p_idx] = p_occ_count

  print(":::", tot_occ_count)

  S = float(sum(tot_occ_count)) / float(n_p*n)
  return S



def eznpp_iter1(ctx):

  n_it = 10

  n = ctx["n"]
  p_n = len(ctx["p"])

  for it in range(n_it):
    score_prv = eznpp_occ_score(ctx)

    #line = []
    #for p_idx in range(len(ctx["p"])):
    #  cn = eznpp_p_cluster_match_count(ctx, p_idx)
    #  line.append( str(cn[0]) + "/" + str(cn[1]))
    #print("#it:", it, "/", n_it, " score:", score_prv, "(", " ".join(line), ")" )
    print("#it:", it, "/", n_it, " score:", score_prv, "(", eznpp_raw(ctx), ")")
    print("s:", ctx["s"])
    print("a:", ctx["a"])

    p_choice = random.randrange(p_n)
    c_choice = random.randrange( len(ctx["cluster_idx"][p_choice]) )

    s_prv = []

    s_idx = []
    s_val = []

    for i in range( len(ctx["cluster_idx"][p_choice][c_choice]) ):

      _idx = ctx["cluster_idx"][p_choice][c_choice][i]
      _s = ctx["cluster_s"][p_choice][c_choice][i]

      s_idx.append(_idx)
      s_val.append(_s)

      s_prv.append( ctx["s"][_idx] )
      ctx["s"][_idx] = _s

    score_nxt = eznpp_occ_score(ctx)

    if score_nxt > score_prv: continue
    if random.randrange(1000) < 30: continue

    # revert
    #
    for i in range( len(s_idx) ):
      _idx = s_idx[i]
      ctx["s"][_idx] = s_prv[i]


def rand_idx_subset(n, k):
  a = []
  for i in range(n): a.append(i)
  a = fisher_yates(a)
  return a[0:k]

def _print_partition(s,a):
  if not PRINT_PARTITION: return
  for i in range(len(s)):
    _s = '+'
    if (s[i] < 0): _s = '-'
    sys.stdout.write( ' ' + _s + str(a[i]) )
  sys.stdout.write("\n")


# Q - CRT instance array
# idx_a - indices of j'th column of Q (A[:] % p_j)
#
def Q_idx_soln_tot(Q,idx_a, j):
  _b = []
  _v = []
  for i in range(len(idx_a)):
    _b.append(Q[ idx_a[i] ][j])
    _v.append(0)
  return count_partition(_b)

# Q - CRT instance matrix
# S - solution vector (|S| = N, S[:] = {0 indeterminate, +-1 fixed}
# idx_a - indices (|idx_a| <= N)
# j - prime index (0 <= j < p_m)
#
# return:
#  number of solutions
#
# Brute force recursive partition count
#
def Q_idx_soln(Q,S,idx_a,j):
  _b = []
  _s = []
  for i in range(len(idx_a)):
    _b.append(Q[ idx_a[i] ][j])
    _s.append(S[ idx_a[i] ])
  return count_partition_s(_b, _s)




def cluster_energy_s(Q,C,s):
  _n = len(Q)
  _m = len(C)
  _sum = 0
  for p_idx in range(_m):
    for c_idx in range(len(C[p_idx])):
      _sum += Q_idx_soln(Q,s,C[p_idx][c_idx],p_idx)
  return _sum

def cluster_energy(Q,C,s):
  _n = len(Q)
  _m = len(C)
  _sum = 0
  for p_idx in range(_m):
    for c_idx in range(len(C[p_idx])):
      u = Q_idx_soln(Q,s,C[p_idx][c_idx],p_idx)
      if u > 0: _sum += 1
  return _sum


# I got worried that this might be a complete dead end,
# so this does a brute force enumeration of solutions
# (sigma sign held in ctx["s"]) and sees if there's a possible
# cluster subset that has it as a solution.
# If we get a solution without a cluster subset, report 'nomatch'
# and count of occupancy for each prime vector in the CRT breakdown,
# otherwise report 'MATCH'
#
# It looks like beta needs to be quite big.
# as a spot test, here are some values where I get
# matches consistently:
#
# eznpp_setup(eznpp_ctx, 24, 13, 1.25, 200.0)
# eznpp_setup(eznpp_ctx, 26, 13, 1.25, 200.0)
# eznpp_setup(eznpp_ctx, 30, 15, 1.25, 250.0)
# eznpp_setup(eznpp_ctx, 30, 15, 1.125, 250.0)
# eznpp_setup(eznpp_ctx, 30, 15, 1.05, 250.0)
#
# I think alpha being closer to 1 is better.
#
# It all depends on how beta scales with instance
# size to see if it's even feasible, so I'm not
# sure if it's feasible in general, or if
# beta can be kept reasonable, but for these small
# instances, it's at least not a negative result.
# Feasibility alone doesn't mean we can use it,
# so, assuming beta can be kept in check and still
# have feasible solutions, figuring out how to exploit
# it for a solution is still needed.
#
COUNTER = 0
def eznpp_brute_stat(ctx, idx):
  global COUNTER
  n = ctx["n"]

  COUNTER += 1
  if (COUNTER%1000000) == 0: print("#", COUNTER, n, len(ctx["s"]))

  if idx == n:

    S = 0
    for i in range(n):
      S += ctx["s"][i] * ctx["a"][i]

    if S != 0: return 0

    _pc = [0]*len(ctx["p"])
    _all_match = True
    for p_idx in range(len(ctx["p"])):

      _p_occ = [0]*n
      _p_occ_count = 0

      for c_idx in range(len(ctx["cluster_idx"][p_idx])):
        _c_match = True
        for i in range(len(ctx["cluster_idx"][p_idx][c_idx])):
          _s_idx = ctx["cluster_idx"][p_idx][c_idx][i]
          _s_val = ctx["cluster_s"][p_idx][c_idx][i]

          if ctx["s"][_s_idx] != _s_val:

            #print("p_idx:", p_idx, "_s_idx:", _s_idx, "_s_val:", _s_val, "s[", _s_idx, "]:", ctx["s"][_s_idx])

            _c_match = False
            break
        if _c_match:
          for i in range(len(ctx["cluster_idx"][p_idx][c_idx])):
            _s_idx = ctx["cluster_idx"][p_idx][c_idx][i]

            if _p_occ[_s_idx] == 0: _p_occ_count += 1
            _p_occ[_s_idx] = 1

      _pc[p_idx] = _p_occ_count
      if _p_occ_count != n:
        _all_match = False
        #break

    if _all_match: print("MATCH")
    else: print("nomatch", _pc)


    #print( ctx["s"] )
    #sys.exit()



    return 1

  _count = 0

  ctx["s"][idx] = 1
  _count += eznpp_brute_stat(ctx, idx+1)

  ctx["s"][idx] = -1
  _count += eznpp_brute_stat(ctx, idx+1)

  return _count


def _main():

  eznpp_setup(eznpp_ctx, 30, 15, 1.05, 250.0)
  eznpp_debug_print(eznpp_ctx)

  eznpp_iter1(eznpp_ctx)

def _main0():

  #eznpp_setup(eznpp_ctx, 30, 15, 1.5, 20.0)
  #eznpp_setup(eznpp_ctx, 24, 13, 1.25, 200.0)
  #eznpp_setup(eznpp_ctx, 26, 13, 1.25, 200.0)
  #eznpp_setup(eznpp_ctx, 30, 15, 1.25, 250.0)
  #eznpp_setup(eznpp_ctx, 30, 15, 1.125, 250.0)
  eznpp_setup(eznpp_ctx, 30, 15, 1.05, 250.0)
  eznpp_debug_print(eznpp_ctx)

  #eznpp_iter(eznpp_ctx)
  c = eznpp_brute_stat(eznpp_ctx, 0)

  print(">>>", c)


_main()


