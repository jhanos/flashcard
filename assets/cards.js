console.log("start cards.js");

const textPage = syscall('space.readPage',page);
textPage.then((text) => {
  const array1 = [...text.matchAll(/(.*)::(.*)/g)];

  var regex = new RegExp('^(.+)\\n\\?\\n((?:(?:\\n|.+).+)+)', 'gm');
  const array2 = [...text.matchAll(regex)];

  const array = array1.concat(array2);
  var questions = []; 
  for(var j = 0;j < array.length; j++) {
    questions.push([array[j][1], array[j][2]]);
  }

  var questioncount = 0;

  const next = document.getElementById("next");
  const previous = document.getElementById("previous");
  const count = document.getElementById("count");

  question.textContent = questions[questioncount][0];
  answer.textContent = questions[questioncount][1];
  count.textContent = (questioncount + 1 ) + "/" + questions.length;

  function updateCards(action) {
    if(action == "previous" ) {questioncount -=1;};
    if(action == "next" ) {questioncount +=1;};
      
    if(questioncount >= 0 && questioncount < questions.length) {
    document.getElementById('answer').style.visibility='hidden';
    document.getElementById('separator').style.visibility='hidden';
    
    count.textContent = (questioncount + 1 ) + "/" + questions.length;
    question.textContent = questions[questioncount][0];
    answer.textContent = questions[questioncount][1];
    }
    
    if(questioncount < 0) {questioncount = 0};
    if(questioncount >= questions.length) {questioncount = questions.length - 1};
  }

  next.addEventListener("click", () => { updateCards('next') });
  previous.addEventListener("click", () => { updateCards('previous') });

});


