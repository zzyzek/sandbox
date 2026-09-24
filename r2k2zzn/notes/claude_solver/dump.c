#define main enum_main
#include "enum.c"
#undef main
static void show(void){
  int R=R_,C=C_;
  for(int r=0;r<R;r++){
    for(int c=0;c<C;c++){ int a=r*C+c; char ch = IST_[a] ? (TCOL_[a]?'B':'A') : (DOM_[a]==1?'a':DOM_[a]==2?'b':'.');
      putchar(ch); if(c<C-1){int e=HS_[a]; putchar(e==1?'-':e==-1?' ':'~');} }
    putchar('\n');
    if(r<R-1){ for(int c=0;c<C;c++){int e=VS_[r*C+c]; putchar(e==1?'|':e==-1?' ':':'); if(c<C-1)putchar(' ');} putchar('\n'); }
  }
}
int main(int argc,char**argv){
  int R=atoi(argv[1]),C=atoi(argv[2]),t[8]; for(int i=0;i<8;i++)t[i]=atoi(argv[3+i]);
  R_=R;C_=C;N_=R*C; int p[4]; for(int i=0;i<4;i++)p[i]=t[2*i]*C+t[2*i+1];
  int N=N_; memset(HS_,0,N); memset(VS_,0,N);
  for(int i=0;i<N;i++){REQ_[i]=2;TCOL_[i]=-1;IST_[i]=0;DOM_[i]=3;}
  int cols[4]={0,0,1,1};
  for(int i=0;i<4;i++){REQ_[p[i]]=1;TCOL_[p[i]]=cols[i];IST_[p[i]]=1;DOM_[p[i]]=1<<cols[i];}
  for(int a=0;a<N;a++){ if(a%C==C-1)HS_[a]=-1; if(a/C==R-1)VS_[a]=-1; }
  /* optional forced edges: extra args "r c d v" (d: 1 right, 2 down; v: 1 in, -1 out) */
  for(int k=11;k+3<argc;k+=4){int r=atoi(argv[k]),c=atoi(argv[k+1]),d=atoi(argv[k+2]),v=atoi(argv[k+3]); *eptr(r*C+c,d)=(signed char)v; printf("set edge (%d,%d) %s = %s\n",r,c,d==1?"right":"down",v==1?"in":"out");}
  int ok=propagate(p);
  printf("plain propagation result=%d\n(- | in, ~ : undecided, blank out; a/b = cell forced color 0/1)\n",ok); show();
  if(argc<=11) printf("full filter (with probing) passes: %d\n", forced_ok(p));
}
