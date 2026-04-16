# Simple counter example to show considering planes
# from each hull isn't enough to find the partition plane.
# The idea is to have two simplexes that have skew edges
# facing each other.
#0 0 0
#1 0 0
0 0 0
1 0 0.5


#0 0 0
#0 1 0
0 0 0
0 1 0.5


0 0 0
0 0 1


#1 0 0
#0 1 0
1 0 0.5
0 1 0.5


#1 0 0
#0 0 1
1 0 0.5
0 0 1


#0 1 0
#0 0 1
0 1 0.5
0 0 1



###
#2 2 0
#2 2 1
0.75 0.75 0
0.75 0.75 1


#2 2 0
#2 3 -2
0.75 0.75 0
0.75 2.25 -0.5


#2 2 0
#3 2 -2
0.75 0.75 0
2.25 0.75 -0.5


#2 2 1
#2 3 -2
0.75 0.75 1
0.75 2.25 -0.5


#2 2 1
#3 2 -2
0.75 0.75 1
2.25 0.75 -0.5


#2 3 -2
#3 2 -2
0.75 2.25 -0.5
2.25 0.75 -0.5
