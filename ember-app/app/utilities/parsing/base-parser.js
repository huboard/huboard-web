function BaseParser(context){
  return {
    context: context,
    parse: parse
  };
}

function parse(input){
  var tree = {};
  this.context.rules.forEach((rule)=> {
    var result = rule.condition(input);
    if(result.length){ tree[rule.name] = result; }
  });

  return tree;
}


export default BaseParser;
