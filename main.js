
// RUN ON PAGE LOAD
let player1_hand;
let player2_hand;

const deckURLLS =  `https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`  // DECK API URL
document.querySelector('#cardsRemainLS').innerHTML = localStorage.getItem('Cards_remaining')  // INPUT CARDS REMAINING FROM LOCAL STORAGE ON DOM
document.querySelector('#newDeckButtonLS').addEventListener('click', drawNewDeck)   // LISTEN FOR CLICK ON NEW DECK

// FUNCTION WHEN CLICK ON DRAW NEW DECK
function drawNewDeck () {

  // API TEMPLATE:
    fetch(deckURLLS)
        .then(res => res.json()) // parse response as JSON
        .then(data => {

          console.log(data) //see what data brings back
          deckID = data.deck_id // grab deck ID and put into variable

          localStorage.setItem('Deck_ID', deckID)  // SET DECK ID TO LOCAL STORAGE
          localStorage.setItem('Cards_remaining', data.remaining)  // SET CARDS REMAINING TO LOCAL STORAGE

          // DOM PRESENTATION CLEAN UP ETC.
          document.querySelector('#cardsRemainLS').innerHTML = data.remaining
          // REMOVE ALL CARD IMAGES
            let intialCards = document.querySelectorAll('.inital_cards')
            intialCards.forEach( el => el.src = '')
            document.querySelectorAll('#player1_div img').forEach( img => img.remove()) //remove all appendedChild cards img
            document.querySelectorAll('#player2_div img').forEach( img => img.remove()) //remove all appendedChild cards img
          document.querySelector('#gameResultLS').innerHTML = ''
          document.querySelector('#dealButtonLS').classList.remove('hidden') 
          
         hideHitStayButtons()
        
          
          document.querySelector('#player1_sum').innerHTML = ''
          document.querySelector('#player2_sum').innerHTML = ''
          
        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

function hideHitStayButtons(){
  document.querySelector('#player1Hit').classList.add('hidden') 
  document.querySelector('#player1Stay').classList.add('hidden') 
  document.querySelector('#player2Hit').classList.add('hidden')
  document.querySelector('#player2Stay').classList.add('hidden')
}

function showHitStayButtons(){
  document.querySelector('#player1Hit').classList.remove('hidden') 
  document.querySelector('#player1Stay').classList.remove('hidden') 
  document.querySelector('#player2Hit').classList.remove('hidden')
  document.querySelector('#player2Stay').classList.remove('hidden')
}


// ******************************
// CLICK ON DRAW INTIAL 4 CARDS
// ******************************
document.querySelector('#dealButtonLS').addEventListener('click', dealCards)  // LISTEN FOR BUTTON CLICK

function dealCards () {
  // clean up DOM when new deal
  document.querySelectorAll('#player1_div img').forEach( img => img.remove()) //remove all appendedChild cards img
  document.querySelectorAll('#player2_div img').forEach( img => img.remove()) //remove all appendedChild cards img
  document.querySelector('#gameResultLS').innerHTML = ''

    let LSdeckID = localStorage.getItem('Deck_ID')      // GRAB DECKID FROM LOCAL STORAGE
    const url =  `https://www.deckofcardsapi.com/api/deck/${LSdeckID}/draw/?count=4`  // LINK TO DRAW CARDS
  // API TEMPLATE:
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
          console.log(data) //see what data brings back
  
          document.querySelector('#player1LS_first').src = data.cards[0].image  // ADD CARD IMAGE TO DOM
          document.querySelector('#player1LS_second').src = data.cards[1].image  // ADD CARD IMAGE TO DOM
          document.querySelector('#player2LS_first').src = data.cards[2].image  // ADD CARD IMAGE TO DOM
          document.querySelector('#player2LS_second').src = data.cards[3].image  // ADD CARD IMAGE TO DOM

          // get player hand, convert to number, return array
          player1_hand =   convertToNo(   [  data.cards[0].value  ,  data.cards[1].value   ]   )
          player2_hand =   convertToNo(   [  data.cards[2].value  ,  data.cards[3].value   ]   )
          // log players hand
          console.log( player1_hand  ) // [ 8, ACE ] array
          console.log( player2_hand  )

           // Determine hand values
           let player1_handvalue = getHandValue ( player1_hand  )
           let player2_handvalue = getHandValue ( player2_hand  )
           console.log( player1_handvalue  )
           console.log( player2_handvalue  )

          // check for ACES   - should return true or false - play twice for 2 aces max on draw
          player1_handvalue = checkForAce( player1_hand , player1_handvalue  )
          player2_handvalue = checkForAce( player2_hand , player2_handvalue  )

          player1_handvalue = checkForAce( player1_hand , player1_handvalue  )
          player2_handvalue = checkForAce( player2_hand , player2_handvalue  )

          console.log( player1_hand )
          console.log( player2_hand )

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
function convertToNo (cardsArray) {    // [ jack, ace ]
    console.log(cardsArray)
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
     return convertedCardsArr // return array [ 10 , 11] for jack, ace
}

// DETERMINE HAND VALUE FROM ARRAY -- parameter is array
function getHandValue (playerhand ) {
  let handValue = 0;
  for (let i = 0; i < playerhand.length; i++) {
      handValue  += playerhand[i] 
  }
  console.log(handValue)
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
      console.log(isAce)
      console.log(handValue)

      if ( handValue > 21 && isAce == true) {
        let index = playerhand.indexOf( 11 ) 
        if (index !== -1 ) {
                playerhand[index] = 1        
        }
        } else {
                return handValue
        }
        console.log( playerhand )
        return getNewHandValue ( playerhand ) // new playerhand
}

function getNewHandValue (playerhand) {
  let newHandValue = 0
  for (let i = 0; i < playerhand.length; i++) {
      newHandValue  += playerhand[i] 
  }
  return newHandValue
}

// DETERMINE WINNER/RESULTS (initial cards)
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

// ********************
//CLICK HIT - PLAYER 1
// ********************
document.querySelector('#player1Hit').addEventListener('click', player1Hit )  // LISTEN FOR "HIT" BUTTON CLICK

function player1Hit () {
    let LSdeckID = localStorage.getItem('Deck_ID')      // GRAB DECKID FROM LOCAL STORAGE
    const url =  `https://www.deckofcardsapi.com/api/deck/${LSdeckID}/draw/?count=1`  // LINK TO DRAW CARDS
  // API TEMPLATE:
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
          console.log(data) //see what data brings back
          
          // ADD NEW CARD IMAGE TO DOM - USING APPENDCHILD
          let player1NewCard_img = document.createElement('img')
          player1NewCard_img.src = data.cards[0].image
          let ulonDom = document.getElementById('player1_div')
          ulonDom.appendChild(player1NewCard_img)

      console.log( player1_hand  ) // log current hand

      // push new card into player hand
      player1_hand.push( data.cards[0].value  )

      // convert to number, return array
      let player1_hit_hand =   convertToNo( player1_hand )     
      console.log(player1_hit_hand)  // return current hand array

      let handValue = getHandValue( player1_hit_hand )
      console.log (   handValue )  // get total card value

      handValue =  checkForAce( player1_hit_hand  , handValue  )  // check for ace 
      // run ace function a total 4 times (max ace is 4)
      handValue =  checkForAce( player1_hit_hand  , handValue  )  
      handValue =  checkForAce( player1_hit_hand  , handValue  )  
      handValue =  checkForAce( player1_hit_hand  , handValue  )  
      console.log( handValue)                                    
      console.log ( player1_hit_hand )

        // determine if player one WIN OR BUST
      if ( handValue == 21 ) {
        document.querySelector('#gameResultLS').classList.remove('hidden')
        document.querySelector('#gameResultLS').innerHTML = "PLAYER 1 IS THE WINNER"
        hideHitStayButtons()

      } else if ( handValue > 21 ) {
        document.querySelector('#gameResultLS').classList.remove('hidden')
        document.querySelector('#gameResultLS').innerHTML = "PLAYER 1 BUSTED"
        hideHitStayButtons()
      } 

      // INPUT SUM ON DOM
      document.querySelector('#player1_sum').innerHTML = handValue
      // INPUT REMAINING CARDS ON DOM
      document.querySelector('#cardsRemainLS').innerHTML = data.remaining

        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

// ********************
//CLICK HIT - PLAYER 2
// ********************
document.querySelector('#player2Hit').addEventListener('click', player2Hit )  // LISTEN FOR "HIT" BUTTON CLICK

function player2Hit () {
    let LSdeckID = localStorage.getItem('Deck_ID')      // GRAB DECKID FROM LOCAL STORAGE
    const url =  `https://www.deckofcardsapi.com/api/deck/${LSdeckID}/draw/?count=1`  // LINK TO DRAW CARDS
  // API TEMPLATE:
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
          console.log(data) //see what data brings back
          
          // ADD NEW CARD IMAGE TO DOM - USING APPENDCHILD
          let player2NewCard_img = document.createElement('img')
          player2NewCard_img.src = data.cards[0].image
          let ulonDom = document.getElementById('player2_div')
          ulonDom.appendChild(player2NewCard_img)

      console.log( player2_hand  ) // log current hand

      // push new card into player hand
      player2_hand.push( data.cards[0].value  )

      // convert to number, return array
      let player2_hit_hand =   convertToNo( player2_hand )     
      console.log(player2_hit_hand)  // return current hand array

      let handValue = getHandValue( player2_hit_hand )
      console.log (   handValue )  // get total card value

      handValue =  checkForAce( player2_hit_hand  , handValue  )  // check for ace 
      // run ace function a total 4 times (max ace is 4)
      handValue =  checkForAce( player2_hit_hand  , handValue  )  
      handValue =  checkForAce( player2_hit_hand  , handValue  )  
      handValue =  checkForAce( player2_hit_hand  , handValue  )  
      console.log( handValue)                                    
      console.log ( player2_hit_hand )

        // determine if player one WIN OR BUST
      if ( handValue == 21 ) {
        document.querySelector('#gameResultLS').classList.remove('hidden')
        document.querySelector('#gameResultLS').innerHTML = "PLAYER 2 IS THE WINNER"
        hideHitStayButtons()

      } else if ( handValue > 21 ) {
        document.querySelector('#gameResultLS').classList.remove('hidden')
        document.querySelector('#gameResultLS').innerHTML = "PLAYER 2 BUSTED"
        hideHitStayButtons()
      } 

      // INPUT SUM ON DOM
      document.querySelector('#player2_sum').innerHTML = handValue
      // INPUT REMAINING CARDS ON DOM
      document.querySelector('#cardsRemainLS').innerHTML = data.remaining

        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}


// ********************
//CLICK STAY - PLAYER 1
// ********************
document.querySelector('#player1Stay').addEventListener('click', player1Stay )  // LISTEN FOR "STAY" BUTTON CLICK
function player1Stay () {

  let player2Value = Number(document.querySelector('#player2_sum').innerHTML)
  let player1Value = Number(document.querySelector('#player1_sum').innerHTML)

  document.querySelector('#player1Hit').classList.add('hidden') 

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
// ********************
//CLICK STAY - PLAYER 2
// ********************
document.querySelector('#player2Stay').addEventListener('click', player2Stay )  // LISTEN FOR "STAY" BUTTON CLICK
function player2Stay () {

  let player2Value = Number(document.querySelector('#player2_sum').innerHTML)
  let player1Value = Number(document.querySelector('#player1_sum').innerHTML)

  document.querySelector('#player2Hit').classList.add('hidden') 
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


// APPEND EXAMPLE-- ADDING LI TO UL
// FUNCTION TO ADD BOOKS TO DOM
// function addBookToDom (bookTitle) {
//   let ulonDom = document.getElementById('bookList')
//   let liOnDom = document.createElement('li')

//   liOnDom.appendChild(document.createTextNode(bookTitle))
//   ulonDom.appendChild(liOnDom)
// }