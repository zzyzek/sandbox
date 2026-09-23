#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/resource.h>
int find_paths_fast(int,int,int,int,int,int,int,int,int,int,int*,int*,int*,int*);
int is_feasible_fast(int,int,int,int,int,int,int,int,int,int);

/* returns NULL if valid, else a reason */
static const char *check(int R,int C,const int *t,const int *p0,int l0,const int *p1,int l1){
    static char buf[200];
    char *cov = calloc(R*C,1);
    const int *ps[2]={p0,p1}; int ls[2]={l0,l1};
    for(int k=0;k<2;k++){
        const int *p=ps[k]; int l=ls[k];
        if(l<1){free(cov);return "empty path";}
        if(p[0]!=t[4*k]||p[1]!=t[4*k+1]){free(cov);return "wrong start";}
        if(p[2*l-2]!=t[4*k+2]||p[2*l-1]!=t[4*k+3]){free(cov);return "wrong end";}
        for(int i=0;i<l;i++){
            int r=p[2*i],c=p[2*i+1];
            if(r<0||r>=R||c<0||c>=C){free(cov);return "out of bounds";}
            if(cov[r*C+c]){free(cov);sprintf(buf,"cell (%d,%d) used twice",r,c);return buf;}
            cov[r*C+c]=1;
            if(i>0 && abs(p[2*i-2]-r)+abs(p[2*i-1]-c)!=1){free(cov);return "non-adjacent step";}
        }
    }
    for(int i=0;i<R*C;i++) if(!cov[i]){free(cov);return "cell not covered";}
    free(cov); return NULL;
}

/* bar bones, minimal command line argument checks */
int main(int argc,char**argv){
  int i;
    if(argc>1 && strcmp(argv[1],"suite")==0){
        FILE*f=fopen("testcases.txt","r"); int n; if(fscanf(f,"%d",&n)!=1) return 1;
        int chk=0,mis=0,badw=0,nf=0;
        for(int i=0;i<n;i++){int R,C,t[8],ex;
            if(fscanf(f,"%d %d %d %d %d %d %d %d %d %d %d",&R,&C,&t[0],&t[1],&t[2],&t[3],&t[4],&t[5],&t[6],&t[7],&ex)!=11)break;
            int *p0=malloc(sizeof(int)*2*R*C),*p1=malloc(sizeof(int)*2*R*C),l0,l1;
            int got=find_paths_fast(R,C,t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],p0,&l0,p1,&l1);
            chk++; if(got!=ex){mis++; if(mis<5)printf("MISMATCH case %d got %d exp %d\n",i,got,ex);}
            if(got==1){nf++; const char*e=check(R,C,t,p0,l0,p1,l1); if(e){badw++; if(badw<5)printf("BAD WITNESS case %d: %s\n",i,e);}}
            free(p0);free(p1);}
        printf("suite: %d checked, %d feasibility mismatches, %d witnesses, %d invalid witnesses\n",chk,mis,nf,badw);
        return 0;
    }
    if(argc>1 && strcmp(argv[1],"feasible")==0){
      int a[10]; for(int i=0;i<10;i++) a[i]=atoi(argv[i+2]);
      int R=a[0],C=a[1],*t=a+2;
      int *p0=malloc(sizeof(int)*2*R*C),*p1=malloc(sizeof(int)*2*R*C),l0,l1;
      int got=is_feasible_fast(R,C,t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7]);
      printf("# %dx%d feasible=%d\n", R,C,got);
      return 0;
    }
    /* single instance: R C s0r s0c t0r t0c s1r s1c t1r t1c */
    int a[10]; for(int i=0;i<10;i++) a[i]=atoi(argv[i+1]);
    int R=a[0],C=a[1],*t=a+2;
    int *p0=malloc(sizeof(int)*2*R*C),*p1=malloc(sizeof(int)*2*R*C),l0,l1;
    clock_t t0=clock();
    int got=find_paths_fast(R,C,t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],p0,&l0,p1,&l1);
    double dt=(double)(clock()-t0)/CLOCKS_PER_SEC;
    printf("# %dx%d feasible=%d time=%.2fs",R,C,got,dt);
    if(got==1){
      const char*e=check(R,C,t,p0,l0,p1,l1);
      printf("# witness=%s len0=%d len1=%d\n",e?e:"valid",l0,l1);

      printf("#path0[%i]\n", l0);
      for (i=0; i<l0; i++) { printf("%i %i\n", p0[2*i], p0[2*i+1]); }
      printf("\n\n");

      printf("#path1[%i]\n", l1);
      for (i=0; i<l1; i++) { printf("%i %i\n", p1[2*i], p1[2*i+1]); }
      printf("\n\n");


    }
    {
      struct rusage u; getrusage(RUSAGE_SELF,&u); printf("# peakRSS=%ldMB",u.ru_maxrss/1024);
    }
    printf("\n");
    if(argc>11 && got==1){ /* print grid */
        char *g=malloc(R*C); memset(g,'.',R*C);
        for(int i=0;i<l0;i++) g[p0[2*i]*C+p0[2*i+1]]='a';
        for(int i=0;i<l1;i++) g[p1[2*i]*C+p1[2*i+1]]='b';
        g[t[0]*C+t[1]]='A'; g[t[2]*C+t[3]]='A'; g[t[4]*C+t[5]]='B'; g[t[6]*C+t[7]]='B';
        for(int r=0;r<R;r++){fwrite(g+r*C,1,C,stdout);putchar('\n');}
    }
    return 0;
}
