
var questioncount = 0;


const again = document.getElementById("again");
const hard = document.getElementById("hard");
const good = document.getElementById("good");
const easy = document.getElementById("easy");

const count = document.getElementById("count");
const question = document.getElementById("question");
const answer = document.getElementById("answer");





function generateDueCards(deck) {
  var cards_keys = Object.keys(deck['cards']);
  var dueCards = {}
  const now = (new Date()).getTime()
  cards_keys.forEach((k) => {
    var cardDueDate = new Date(deck['cards'][k]['scheduling']['due']);
    if( cardDueDate.getTime() < now ){
      dueCards[k] = deck['cards'][k];
    }
  });
  return dueCards;
}





var deck = syscall("system.invokeFunction", "flashcard.createDeck", page);
deck.then((d)  => {
  var dueCards = generateDueCards(d);
  var dueCards_keys = Object.keys(dueCards);

  count.textContent = dueCards_keys.length;

  question.textContent = dueCards[dueCards_keys[questioncount]]['front'];
  answer.innerHTML = dueCards[dueCards_keys[questioncount]]['back'];

  function changeCards(action) {
    if(action == "previous" ) {questioncount -=1;};
    if(action == "next" ) {questioncount +=1;};
      
    if(questioncount >= 0 && questioncount < dueCards_keys.length) {
    hide();
    
    count.textContent =  (Object.keys(dueCards)).length;
    question.textContent = dueCards[dueCards_keys[questioncount]]['front'];
    answer.innerHTML = dueCards[dueCards_keys[questioncount]]['back'];
    }
    
    if(questioncount < 0) {questioncount = 0};
    if(questioncount >= dueCards_keys.length) {questioncount = dueCards_keys.length - 1};
  }

//previous.addEventListener("click", () => { changeCards('previous') });

  function updateCard(rating) {
    var deckUpdated = syscall("system.invokeFunction", "flashcard.updateDeck", page, d, dueCards_keys[questioncount], rating);
    deckUpdated.then((du)  => {
      //console.log(du);
      d = du;
      dueCards = generateDueCards(du);
      changeCards('next');
    });
  }

function show() {
  document.getElementById('separator').style.visibility='visible';
  document.getElementById('answer').style.visibility='visible';
  document.getElementById('rate').style.visibility='visible';
  document.getElementById('display').style.visibility='hidden';
}

function hide() {
  document.getElementById('separator').style.visibility='hidden';
  document.getElementById('answer').style.visibility='hidden';
  document.getElementById('rate').style.visibility='hidden';
  document.getElementById('display').style.visibility='visible';
}

question.addEventListener("click", () => { show() });
display.addEventListener("click", () => { show() });
again.addEventListener("click", () => { updateCard('again') });
hard.addEventListener("click", () => { updateCard('hard') });
good.addEventListener("click", () => { updateCard('good') });
easy.addEventListener("click", () => { updateCard('easy') });
});


