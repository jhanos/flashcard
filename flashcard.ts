import { asset, editor, system, space } from "@silverbulletmd/silverbullet/syscalls";

export function parse(text) {

  const array1 = [...text.matchAll(/(.*)::(.*)/g)];

  var regex = new RegExp('^(.+)\\n\\?\\n((?:(?:\\n|.+).+)+)', 'gm');
  const array2 = [...text.matchAll(regex)];

  
  const array = array1.concat(array2);
  var data = []; 
  for(var j = 0;j < array.length; j++) {
    data.push([array[j][1], array[j][2]]);
  }
  return data;
}

export async function generateDecks() {

  const result = await system.invokeFunction("index.queryObjects", "flashcards","page");
  var decksQA = {};
  for(var i = 0;i < result.length; i++) {
    var page = result[i]["name"];
    var text = await space.readPage(page);
    decksQA[page] = parse(text);
  }
  return decksQA;
}



export async function showDecks() {
  console.log('start showDecks()');
  const decks = await generateDecks();
  const decks_keys = Object.keys(decks);
  var decksHtml = await asset.readAsset("flashcard","assets/decks.html");
  const decksJS = await asset.readAsset("flashcard","assets/decks.js");
  for(var k = 0;k < decks_keys.length; k++) {
    var page = decks_keys[k];
    decksHtml += '<button type="button" onclick="syscall(\'system.invokeFunction\',\'flashcard.showCards\',\'' + page + '\');">' + page + '</button> (with ' + decks[page].length + ' cards)<br><br>';
  }
  
  await editor.showPanel("modal", 50, decksHtml, decksJS );

}

export async function showCards(page) {

  console.log('start showCards()');
  const cardHtml = await asset.readAsset("flashcard", "assets/cards.html");
  var cardJS = 'page = \'' + page + '\';';
  cardJS += await asset.readAsset("flashcard", "assets/cards.js");
  await editor.showPanel("modal", 50, cardHtml, cardJS );
  console.log('end showCards()');
}
