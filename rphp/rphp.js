

function rphp_init(data) {
  let ctx = data;


  ctx.size = [0,0];
  ctx.size[0] = data.G[0].length;
  ctx.size[1] = data.G.length;

  let V = [];
  for (let j=0; j<ctx.size[1]; j++) {
    V.push([]);
    for (let i=0; i<ctx.size[0]; i++) {
      V[j].push( (data.G[j][i] == '*') ? 1 : 0 );
    }
  }

  ctx["V"] = V;

  return ctx;
}


function _main(argv) {
  var fs = require("fs");

  if (argv.length > 0) {
    let data_txt = fs.readFileSync(argv[0]);
    let data = JSON.parse(data_txt);
    console.log(data);

    let ctx = rphp_init(data);
    console.log(ctx);
  }

  else {
    console.log("provide file");
  }

}

_main(process.argv.slice(2));
