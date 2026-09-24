import re, subprocess, sys
sys.argv=["x","0"]
exec(open("corner4.py").read().split("# ---- stage 2 ----")[0])   # rebuild pats, res1, cand, trivial(), bonly3
lines="\n".join(f"12 12 {' '.join(map(str,p))}" for p in cand)+"\n"
r=subprocess.run(["./enum","exact"],input=lines,capture_output=True,text=True,timeout=280).stdout.split()
print("exact on 12x12:", {x:r.count(x) for x in set(r)})
onp=lambda q:q[0]==0 or q[1]==0
def rel(p):
    P=[(p[0],p[1]),(p[2],p[3])]; Q=[(p[4],p[5]),(p[6],p[7])]
    tags=[]
    for A,B in ((P,Q),(Q,P)):
        for i in range(2):
            if (frozenset(A),B[i]) in bonly3: tags.append(f"contains boundary-only 3-pattern (A={sorted(A)}, B={B[i]}), 4th at {B[1-i]} {'perimeter' if onp(B[1-i]) else 'interior'}")
    for x in P:
        for y in Q:
            if {x,y}=={(1,2),(2,1)}: tags.append("contains the widget (1,2)-(2,1)")
    return tags
for p,x in zip(cand,r):
    A={(p[0],p[1]),(p[2],p[3])}; B={(p[4],p[5]),(p[6],p[7])}
    print(x, "A:",sorted(A),"B:",sorted(B), "|", "; ".join(rel(p)) or "no known sub-pattern")
