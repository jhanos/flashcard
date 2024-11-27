import { asset, editor, system, space, datastore } from "@silverbulletmd/silverbullet/syscalls";
//import { createEmptyCard, formatDate, fsrs, generatorParameters, Rating, Grades} from 'ts-fsrs';
import { createEmptyCard, fsrs, Rating} from 'ts-fsrs';

export function parse(text) {

  const start = new Date()
  const array1 = [...text.matchAll(/(.*)::(.*)/g)];

  var regex = new RegExp('^(.+)\\n\\?\\n((?:(?:\\n|.+).+)+)', 'gm');
  const array2 = [...text.matchAll(regex)];

  
  const array = array1.concat(array2);
  var data = {}; 
  for(let j = 0;j < array.length; j++) {
    var idBase64 = btoa(array[j][1] + array[j][2]);
    data[idBase64] = {}
    data[idBase64]['front'] = array[j][1];
    data[idBase64]['back'] = array[j][2];
  }

  console.log('time parse: ' + ((new Date()).getTime() - start.getTime()))
  return data;
}

export async function createDeck(page) {

  var text = await space.readPage(page);
  var QA = parse(text);
  var qa_keys = Object.keys(QA);
  var deck = await datastore.get("p_flashcards_" + page )
  var now = new Date();
  const f = fsrs();

  if (deck == undefined) {
    // New deck
    var deck = {};
    deck['cards'] = {};
    deck.lastModified = now.getTime();
    qa_keys.forEach((k) => {        
          let scheduling = createEmptyCard();        
          deck['cards'][k] = {};
          deck['cards'][k]['front'] = QA[k]['front'] 
          deck['cards'][k]['back'] = QA[k]['back']   
          deck['cards'][k]['scheduling'] = scheduling
      });
    await datastore.set("p_flashcards_" + page, deck)
  } else {
    var info = await space.getPageMeta(page);
    var pageLastModified = new Date(info['lastModified']);
    //deckLastModified = new Date(deck.lastModified);
    // Check if page is modified since last check
    if ( pageLastModified.getTime() > deck.lastModified ) {
      console.log('deck check is less recent')
      var deck_keys = Object.keys(deck['cards']);
      qa_keys.forEach((k) => {
        if(!deck_keys.includes(k)){
          //console.log('create ' + e)
          let scheduling = createEmptyCard();
          deck['cards'][k] = {};
          deck['cards'][k]['front'] = QA[k]['front']
          deck['cards'][k]['back'] = QA[k]['back']
          deck['cards'][k]['scheduling'] = scheduling
        }
      });
      deck_keys.forEach((k) => {
        if(!qa_keys.includes(k)){
          delete deck['cards'][k];
        }
      });
      deck.lastModified = now.getTime();
      await datastore.set("p_flashcards_" + page, deck)
    }
  }
  return deck
  //let cardUpdated = f.next(card, now, Rating.Easy);

}

export async function updateDeck(page, card) {

    var text = await space.readPage(page);

}

export async function generateDecks() {

  const result = await system.invokeFunction("index.queryObjects", "flashcards","page");
  var decksQA = {};
  for(let i = 0;i < result.length; i++) {
    var page = result[i]["name"];
    decksQA[page] = await createDeck(page);
  }
  return decksQA;
}

export function generateDueCards(page, decks) {
  var cards = decks[page]['cards']
  var cards_keys = Object.keys(cards);
  var dueCards = {}
  const now = (new Date()).getTime()
  cards_keys.forEach((k) => {
    var cardDueDate = new Date(cards[k]['scheduling']['due'])
    if( cardDueDate.getTime() < now ){
      dueCards[k] = cards[k];
    }
  });
  return dueCards
}


export async function showDecks() {
  console.log('start showDecks()');
  const start = new Date()
  const decks = await generateDecks();
  const decks_keys = Object.keys(decks);
  var decksHtml = await asset.readAsset("flashcard","assets/decks.html");
  const decksJS = await asset.readAsset("flashcard","assets/decks.js");
  for(let k = 0;k < decks_keys.length; k++) {
    var page = decks_keys[k];
    var cardsCount = Object.keys(decks[page]['cards']).length
    var dueCards = generateDueCards(page, decks);
    var dueCardsCount = (Object.keys(dueCards)).length;
    decksHtml += '<button type="button" onclick="syscall(\'system.invokeFunction\',\'flashcard.showCards\',\'' + page + '\');">' + page + '</button> (due: ' + dueCardsCount + ', total: ' + cardsCount + 'cards)<br><br>';
  }
  
  console.log('time showDecks: ' + ((new Date()).getTime() - start.getTime()))
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

export async function testFlashcards() {

  console.log('start testFlashcards()');
  //const params = generatorParameters({ enable_fuzz: true, enable_short_term: false });
  
  var decks = await generateDecks();
  console.log(decks)

  //const f = fsrs();
  //const now = new Date();
  //let card = createEmptyCard();
  //let cardUpdated = f.next(card, now, Rating.Easy);

}
