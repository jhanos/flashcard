
var questioncount = 0;

const next = document.getElementById("next");
const previous = document.getElementById("previous")
const count = document.getElementById("count");
//const question = document.getElementById("question");
//const answer = document.getElementById("answer");





function generateDueCards(deck) {
  var cards = deck['cards']
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





const deck = syscall("system.invokeFunction", "flashcard.createDeck", page);
deck.then((d)  => {
  var dueCards = generateDueCards(d)
  var dueCards_keys = Object.keys(dueCards);

  count.textContent = (questioncount + 1 ) + "/" + dueCards_keys.length;

  question.textContent = dueCards[dueCards_keys[questioncount]]['front'];
  answer.textContent = dueCards[dueCards_keys[questioncount]]['back'];

function updateCards(action) {
  if(action == "previous" ) {questioncount -=1;};
  if(action == "next" ) {questioncount +=1;};
    
  if(questioncount >= 0 && questioncount < dueCards_keys.length) {
  document.getElementById('answer').style.visibility='hidden';
  document.getElementById('separator').style.visibility='hidden';
  
  count.textContent = (questioncount + 1 ) + "/" + dueCards_keys.length;
  question.textContent = dueCards[dueCards_keys[questioncount]]['front'];
  answer.textContent = dueCards[dueCards_keys[questioncount]]['back'];
  }
  
  if(questioncount < 0) {questioncount = 0};
  if(questioncount >= dueCards_keys.length) {questioncount = dueCards_keys.length - 1};
}

next.addEventListener("click", () => { updateCards('next') });
previous.addEventListener("click", () => { updateCards('previous') });

});


