(function(){
  var debugUtils = shell.loadLibrary("debugUtils");
  var DecomposerRecipe = debugUtils.findClass("minechem.tileentity.decomposer.DecomposerRecipe")
  var decomposerRecipes = DecomposerRecipe.getField("recipes").get(null);
  var DecomposerRecipeSuper = debugUtils.findClass("minechem.tileentity.decomposer.DecomposerRecipeSuper");
  var DecomposerRecipeSelect = debugUtils.findClass("minechem.tileentity.decomposer.DecomposerRecipeSelect");
  var DecomposerRecipeChance = debugUtils.findClass("minechem.tileentity.decomposer.DecomposerRecipeChance");
  var Element = debugUtils.findClass("minechem.item.element.Element");
  var Molecule = debugUtils.findClass("minechem.item.molecule.Molecule");
  var ElementEnum = debugUtils.findClass("minechem.item.element.ElementEnum");
  var MoleculeEnum = debugUtils.findClass("minechem.item.molecule.MoleculeEnum");
  var elementConstructor = Element.getConstructor(ElementEnum, java.lang.Integer.TYPE);
  var moleculeConstructor = Molecule.getConstructor(MoleculeEnum, java.lang.Integer.TYPE);
  var MinechemBucketItem = debugUtils.findClass("minechem.item.bucket.MinechemBucketItem");

  var minechem = {};
  
  minechem.locateElement = function(name) {
    var target;
    if ( /^e\d+$/m.test(name) ) {
      target = elementConstructor.newInstance(
        ElementEnum.getField("elements").get(null).get(new java.lang.Integer(name.substr(1))),
        new java.lang.Integer(1)
      );
      if ( target.element == null )
        throw "element not found";
    } else if ( /^m\d+$/m.test(name) ) {
      target = moleculeConstructor.newInstance(
        MoleculeEnum.getField("molecules").get(null).get(new java.lang.Integer(name.substr(1))),
        new java.lang.Integer(1)
      );
      if ( target.molecule == null )
        throw "molecule not found";
    } else {
      if ( ElementEnum.getField("nameToElements").get(null).get(name) != null ) {
        target = elementConstructor.newInstance(
          ElementEnum.getField("nameToElements").get(null).get(name),
          new java.lang.Integer(1)
        );
        if ( target.element == null )
          throw "element not found";
      } else {
        target = moleculeConstructor.newInstance(
          MoleculeEnum.getField("nameToMolecules").get(null).get(name),
          new java.lang.Integer(1)
        );
        if ( target.molecule == null )
          throw "molecule not found";
      }
    }
    
    var containsElement = function(search, target) {
      if ( search.sameAs(target) )
        return search.amount;
      if ( Element.isInstance(search) ) {
        return 0;
      } else if ( Molecule.isInstance(search) ) {
        var count = 0;
        debugUtils.findInside(search.molecule.components(), function(chemical) {
          count += containsElement(chemical, target);
        });
        return count;
      } else {
        throw "unexpected type" + search.getClass();
      }
    }
    
    var results = [];
    debugUtils.findInside(decomposerRecipes.values(), function(recipe){
      if ( MinechemBucketItem.isInstance(recipe.getInput()) ) {
        return; // the buckets are already covered by the molecule items
      }
      if ( ! DecomposerRecipeSuper.isInstance(recipe) ) {
        var outputs;
        if ( DecomposerRecipeSelect.isInstance(recipe) ) {
          outputs = recipe.getAllPossibleRecipes();
        } else {
          outputs = [recipe];
        }
        var counts = [];
        var shouldAdd = false;
        debugUtils.findInside(outputs,function(item){
          counts[counts.length] = 0;
          debugUtils.findInside(item.getOutputRaw(),function(chemical){
            counts[counts.length-1] += containsElement(chemical, target);
          });
          if ( counts[counts.length-1] > 0 )
            shouldAdd = true;
        });
        var chance = DecomposerRecipeChance.isInstance(recipe) ? recipe.chance : 1;
        if ( shouldAdd ) {
          results[results.length] = {stack:recipe.getInput(), counts:counts, chance:chance};
        }
      }
    });
    return results;
  }

  minechem.printLocateElement = function(name) {
    var res = minechem.locateElement(name);
    for ( var i = 0; i < res.length; i++ ) {
      var sum = 0;
      for ( var j = 0; j < res[i].counts.length; j++ )
        sum += res[i].counts[j];
      res[i].average = sum / res[i].counts.length;
    }
    res.sort(function(a,b){
      return a.average*a.chance - b.average*b.chance
    });
    
    var formatPercent = function(num) {
      return "" + (Math.round(num*10000)/100) + "%"
    }
    
    for ( var i = res.length - 1 ; i >= 0; i-- ) {
      var name = res[i].stack.func_82833_r/*getDisplayName*/();
      print(name);
      var avg = (res[i].average * res[i].chance);
      avg = Math.round(avg*10000)/10000
      print("average : " + avg);
      res[i].counts.sort();
      for ( var j = res[i].counts.length - 1; j >= 0; j-- ) {
        var startCount = j;
        while ( j > 0 && res[i].counts[j] == res[i].counts[j-1] )
          j--;
        var count = startCount - j + 1;
        var chance = res[i].chance*count/res[i].counts.length;
        if ( res[i].counts[j] == 0 )
          chance += (1 - res[i].chance)
        print("\t" + formatPercent(chance) + " : " + res[i].counts[j]);
      }
      if ( res[i].chance != 1 && res[i].counts[0] != 0 )
        print("\t" + formatPercent(1-res[i].chance) + " : " + 0);
    }
  }
  
  return minechem;
})();