
// PAGE LOAD - GLOBAL VAR.
let player1_hand;
let player2_hand;
let numberOfDecks = 1;

const deckURLLS =  `https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${numberOfDecks}`  // DECK API URL
document.querySelector('#cardsRemainLS').innerHTML = localStorage.getItem('Cards_remaining')  // INPUT CARDS REMAINING FROM LOCAL STORAGE ON DOM
document.querySelector('#newDeckButtonLS').addEventListener('click', drawNewDeck)   // CLICK ON NEW DECK
document.querySelector('#dealButtonLS').addEventListener('click', dealCards)  // DRAW CARDS
document.querySelector('#player1Hit').addEventListener('click', player1Hit )  // LISTEN FOR "HIT" BUTTON CLICK
document.querySelector('#player2Hit').addEventListener('click', player2Hit )  // LISTEN FOR "HIT" BUTTON CLICK
document.querySelector('#player2Stay').addEventListener('click', player2Stay )  // LISTEN FOR "STAY" BUTTON CLICK
document.querySelector('#player1Stay').addEventListener('click', player1Stay )  // LISTEN FOR "STAY" BUTTON CLICK

// CLICK ON DRAW NEW DECK
function drawNewDeck () {
    fetch(deckURLLS)
        .then(res => res.json()) 
        .then(data => {
          deckID = data.deck_id // grab deck ID
          localStorage.setItem('Deck_ID', deckID)  // DECK ID TO LS
          localStorage.setItem('Cards_remaining', data.remaining)  // CARDS REMAINING TO LS
          // RESET DOM FOR NEW DECK
          document.querySelector('#cardsRemainLS').innerHTML = data.remaining //CARDS REMAINING TO DOM
          let intialCards = document.querySelectorAll('.inital_cards')
          intialCards.forEach( el => el.src = '')
          resetDom()
          document.querySelector('#dealButtonLS').classList.remove('hidden') 
          hideHitStayButtons()
          document.querySelector('#player1_sum').innerHTML = ''
          document.querySelector('#player2_sum').innerHTML = ''
        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

// reset DOM - images and game results
function resetDom () {
  document.querySelectorAll('#player1_div img').forEach( img => img.remove()) //remove all cards imgs
  document.querySelectorAll('#player2_div img').forEach( img => img.remove()) //remove all cards imgs
  document.querySelector('#gameResultLS').innerHTML = ''
}

// HIDE HIT AND STAND BUTTONS
function hideHitStayButtons(){
  document.querySelector('#player1Hit').classList.add('hidden') 
  document.querySelector('#player1Stay').classList.add('hidden') 
  document.querySelector('#player2Hit').classList.add('hidden')
  document.querySelector('#player2Stay').classList.add('hidden')
}
// SHOW HIT AND STAND BUTTONS
function showHitStayButtons(){
  document.querySelector('#player1Hit').classList.remove('hidden') 
  document.querySelector('#player1Stay').classList.remove('hidden') 
  document.querySelector('#player2Hit').classList.remove('hidden')
  document.querySelector('#player2Stay').classList.remove('hidden')
}
// CLICK ON DRAW INTIAL 4 CARDS
function dealCards () {
    resetDom()
    let LSdeckID = localStorage.getItem('Deck_ID')      // GRAB DECKID FROM LOCAL STORAGE
    const url =  `https://www.deckofcardsapi.com/api/deck/${LSdeckID}/draw/?count=4`  // LINK TO DRAW CARDS
  // API TEMPLATE:
    fetch(url)
        .then(res => res.json())
        .then(data => {
          document.querySelector('#player1LS_first').src = data.cards[0].image  // ADD CARD IMAGE TO DOM
          document.querySelector('#player1LS_second').src = data.cards[1].image  // ADD CARD IMAGE TO DOM
          document.querySelector('#player2LS_first').src = data.cards[2].image  // ADD CARD IMAGE TO DOM
          document.querySelector('#player2LS_second').src = data.cards[3].image  // ADD CARD IMAGE TO DOM

          // get player hand, convert face cards to numbers, return array
          player1_hand = convertToNo( [data.cards[0].value, data.cards[1].value] )
          player2_hand = convertToNo( [data.cards[2].value, data.cards[3].value] )

          // Determine hand values
          let player1_handvalue = getHandValue (player1_hand)
          let player2_handvalue = getHandValue (player2_hand)

          // check for ACES   - should return true or false - play twice for 2 aces max on draw
          let numberOfAces = numberOfDecks * 4 // determine how many aces in deck
          for ( let i = 0 ; i < numberOfAces ; i++) {
            player1_handvalue = checkForAce( player1_hand , player1_handvalue  )
            player2_handvalue = checkForAce( player2_hand , player2_handvalue  )
          }

          // play game- determine result & display HIT/STAY buttons
          determineGame ( player1_handvalue , player2_handvalue )
          
          //   // INPUT SUM ON DOM
          document.querySelector('#player1_sum').innerHTML = player1_handvalue
          document.querySelector('#player2_sum').innerHTML = player2_handvalue
         
          document.querySelector('#cardsRemainLS').innerHTML = data.remaining  // ADD CARDS REMAINING TO DOM
          localStorage.setItem('Cards_remaining', data.remaining )  // ADD CARDS REMAINING INFO TO LOCAL STORAGE UPON EACH DRAW

        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

// CONVERT FACE CARDS TO A NUMBER
function convertToNo (cardsArray) {    
    let convertedCardsArr = []
    for (let i = 0; i < cardsArray.length ; i++ ) {
      if (  cardsArray[i] ==  'JACK' ||   cardsArray[i] ==  'QUEEN' || cardsArray[i] ==  'KING' ) {
        convertedCardsArr.push( 10 )
      } else if ( cardsArray[i] ==  'ACE'   ) {
        convertedCardsArr.push( 11 )
      } else {
        convertedCardsArr.push( Number(cardsArray[i]) )
      }
    }
     return convertedCardsArr 
}

// DETERMINE HAND VALUE FROM ARRAY -- parameter is array
function getHandValue (playerhand ) {
  let handValue = 0;
  for (let i = 0; i < playerhand.length; i++) {
      handValue  += playerhand[i] 
  }
  return handValue
}

// check hands for ACES
function checkForAce ( playerhand , handValue ) {
    let isAce = false
      for (let i = 0 ; i < playerhand.length ; i++) {
              if ( playerhand[i] == 11) {
                      isAce = true
              } 
      }
      if ( handValue > 21 && isAce == true) {
        let index = playerhand.indexOf( 11 ) 
        if (index !== -1 ) {
                playerhand[index] = 1        
        }
        } else {
                return handValue
        }
        return getNewHandValue ( playerhand ) // new playerhand
}
  function getNewHandValue (playerhand) {
    let newHandValue = 0
    for (let i = 0; i < playerhand.length; i++) {
        newHandValue  += playerhand[i] 
    }
    return newHandValue
  }

// DETERMINE WINNER (initial 4 cards)
function determineGame (player1, player2) {
  if (player1 == 21 && player2 == 21 ) {
    document.querySelector('#gameResultLS').classList.remove('hidden') 
    document.querySelector('#gameResultLS').innerHTML = "TIE GAME"
    hideHitStayButtons()

  } else if( player2 == 21  ) {
    document.querySelector('#gameResultLS').classList.remove('hidden')
    document.querySelector('#gameResultLS').innerHTML = "PLAYER 2 WIN"
    hideHitStayButtons()
    
  } else if( player1 == 21 ) {
    document.querySelector('#gameResultLS').classList.remove('hidden')
    document.querySelector('#gameResultLS').innerHTML = "PLAYER 1 WIN"
    hideHitStayButtons()
   
  } else {
    showHitStayButtons()
    
  }
}

//CLICK HIT - PLAYER 1
function player1Hit () {
    let LSdeckID = localStorage.getItem('Deck_ID')      // GRAB DECKID FROM LOCAL STORAGE
    const url =  `https://www.deckofcardsapi.com/api/deck/${LSdeckID}/draw/?count=1`  // LINK TO DRAW CARDS
  // API TEMPLATE:
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
          
          // ADD NEW CARD IMAGE TO DOM - USING APPENDCHILD
          let player1NewCard_img = document.createElement('img')
          player1NewCard_img.src = data.cards[0].image
          let ulonDom = document.getElementById('player1_div')
          ulonDom.appendChild(player1NewCard_img)

          // push new card into player hand
          player1_hand.push( data.cards[0].value  )

          // convert to number, return array
          let player1_hit_hand =   convertToNo( player1_hand )     

          let handValue = getHandValue( player1_hit_hand )
          // check for Aces
          let numberOfAces = numberOfDecks * 4 // determine how many aces in deck
          for ( let i = 1 ; i <= numberOfAces ; i++) {  
            handValue =  checkForAce( player1_hit_hand  , handValue  )
        }     

      checkWinOnHit(handValue,'1')

      // INPUT SUM ON DOM
      document.querySelector('#player1_sum').innerHTML = handValue
      // INPUT REMAINING CARDS ON DOM
      document.querySelector('#cardsRemainLS').innerHTML = data.remaining

        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

//CLICK HIT - PLAYER 2
function player2Hit () {
    let LSdeckID = localStorage.getItem('Deck_ID')      // GRAB DECKID FROM LOCAL STORAGE
    const url =  `https://www.deckofcardsapi.com/api/deck/${LSdeckID}/draw/?count=1`  // LINK TO DRAW CARDS
  // API TEMPLATE:
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
          
          // ADD NEW CARD IMAGE TO DOM - USING APPENDCHILD
          let player2NewCard_img = document.createElement('img')
          player2NewCard_img.src = data.cards[0].image
          let ulonDom = document.getElementById('player2_div')
          ulonDom.appendChild(player2NewCard_img)

      // push new card into player hand
      player2_hand.push( data.cards[0].value  )

      // convert to number, return array
      let player2_hit_hand =   convertToNo( player2_hand )     

      let handValue = getHandValue( player2_hit_hand )

      // check Aces
      let numberOfAces = numberOfDecks * 4 
      for ( let i = 1 ; i <= numberOfAces ; i++) {
          handValue =  checkForAce( player2_hit_hand  , handValue  )  
      }    
      checkWinOnHit(handValue,'2')

      // INPUT SUM ON DOM
      document.querySelector('#player2_sum').innerHTML = handValue
      // INPUT REMAINING CARDS ON DOM
      document.querySelector('#cardsRemainLS').innerHTML = data.remaining

        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

// CHECK WINNERS WHEN HIT NEW CARD
function checkWinOnHit (handValue,player) {
  if ( handValue == 21 ) {
    document.querySelector('#gameResultLS').classList.remove('hidden')
    document.querySelector('#gameResultLS').innerHTML = `PLAYER ${player} IS THE WINNER`
    hideHitStayButtons()

  } else if ( handValue > 21 ) {
    document.querySelector('#gameResultLS').classList.remove('hidden')
    document.querySelector('#gameResultLS').innerHTML = `PLAYER ${player} BUSTED`
    hideHitStayButtons()
  } 
}

//CLICK STAY - PLAYER 1
function player1Stay () {
  document.querySelector('#player1Hit').classList.add('hidden') 
  checkWin()
}

//CLICK STAY - PLAYER 2
function player2Stay () {
  document.querySelector('#player2Hit').classList.add('hidden') 
  checkWin()
}

//CHECK WIN (STAND BUTTONS)
function checkWin () {
  let player2Value = Number(document.querySelector('#player2_sum').innerHTML)
  let player1Value = Number(document.querySelector('#player1_sum').innerHTML)

  if( document.querySelector('#player2Hit').classList.contains('hidden') && document.querySelector('#player1Hit').classList.contains('hidden')  ) {
    if( player1Value > player2Value ) {
       document.querySelector('#gameResultLS').innerHTML = "PLAYER 1 IS THE WINNER"
       document.querySelector('#gameResultLS').classList.remove('hidden')
       hideHitStayButtons()
    } else if (  player1Value < player2Value    ) {
      document.querySelector('#gameResultLS').innerHTML = "PLAYER 2 IS THE WINNER"
      document.querySelector('#gameResultLS').classList.remove('hidden')
      hideHitStayButtons()
    } else {
     document.querySelector('#gameResultLS').innerHTML = "TIED GAME"
     document.querySelector('#gameResultLS').classList.remove('hidden')
     hideHitStayButtons()
    }
  } 
}


