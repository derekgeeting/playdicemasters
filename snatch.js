// for( var i=0; i<setnames.length; i++ ) {
//   var setname = setnames[i];
//   if(!setname) { continue; }
//   var set = eval(setname);  
// }

var cards = [];

var types = ['','M','F','B','S'];

function doit(set,setname) {
  var is_dnd = setname.substring(0,3) == 'bff';
  var set_dice = {};
  for(var i = 0; i < set.length; i++) {
    var p = set[i].substring(is_dnd? 7: 5).split('|');
    var cost = parseInt(set[i][1],16);
    cards.push({
      set: setname,
      number: i+1,
      name: p[0],
      subname: p[1],
      cost: cost,
      type: types[set[i][2]]
    });
  }
}

// doit(avx,'avx');
// doit(uxm,'uxm');
// doit(aou,'aou');
// doit(dcjl,'jl');
// doit(wol,'wol');
doit(bff,'bff');
// doit(ygo,'ygo');
