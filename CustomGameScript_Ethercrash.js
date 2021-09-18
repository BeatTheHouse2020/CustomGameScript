var numberOfGames = 5000;
var bettingActive = false; 
var activationNumber = 1; //activation number
var waitCashOut = 200; //activation wait cashout  aka when 4 games under 1.2 occur then start betting this matrix.


//Game Matrix
let betMatrix = [
    [100, 1.3],     //100 BET , 1.3 Payout - GAME #1
    [600, 1.3],     //600 BET , 1.3 Payout - GAME #2
    [1800, 1.5],    //1800 BET , 1.5 Payout - GAME #3
    [6000, 1.5],    //6000 BET , 1.5 Payout  - GAME #4
    [12000, 1.8],  //12000 BET, 1.8 Payout - GAME #5

];


var currentBet = 0;
var cashOut =0;
var activateGames = 0;
var currentGame = 0;
var totalGames = 0;
var wait=false;


if(activationNumber == 0)
  bettingActive = true;

var startingBet = currentBet;
var startingBalance = engine.getBalance()/100;

console.log('Custom Script is running.... ');
console.log('Starting Balance: ', startingBalance);


engine.on('game_starting', function(info) {

  totalGames++;
  var balance = engine.getBalance()/100;

  if(totalGames > numberOfGames)
  {
    bettingActive = false;
    console.log('Total Games reached succesfully. Shutting down.');
  }

  if(bettingActive)
  {
      
      currentBet = betMatrix[currentGame][0]*100;
      
      cashOut = betMatrix[currentGame][1];
      
      console.log('Game #', currentGame, 'PLACE BET: ', roundBit(currentBet)/100, ' Cashout: ',  cashOut, ' User Balance: ', balance);

      if (currentBet > balance) 
      {
          console.log('Game KILLED BET TO BIG');
          engine.stop(); 
          
      }
      else
      {
        if(currentBet != 0)
          engine.placeBet(roundBit(currentBet), cashOut*100);
      }
      
  }
  else
  {
    console.log('Current Game:', currentGame, 'NO BET: User Balance: ', balance);
  }


});

engine.on('game_crash', function(data) {

  var balance = engine.getBalance()/100;    
  var wagered = engine.lastGamePlayed();
  var bust = data.game_crash/100;
  var won = engine.lastGamePlay() == "WON";
  
  if (!wagered) 
  {
        console.log('SKIP:', bust, ' Betting Active: ', bettingActive);
        
        if(currentGame == 0)
        {
          if(bust < waitCashOut)
          {
            activateGames++;

            if(activateGames == activationNumber)
            {
              bettingActive = true;
              console.log('Enabling Betting. Activation hit.');
            }
          
            return;
          }
          else
          {
            console.log('RESET WAIT.');
            activateGames = 0;
            return;
          }
        }
        else
        {
          currentGame++;
          return;
        }
  }

  activateGames = 0; 
  var profit =  (balance - startingBalance).toFixed(2);

  if (won) 
  {
      var winAmount = ((currentBet*cashOut) - currentBet) / 100;
      
      console.log('Current Game:', currentGame, 'WON : ', winAmount, ' Bust: ', bust, ', Balance: ', balance, ', Starting Balance: ', startingBalance, ' Profit: ', profit);
      currentGame=0;
      bettingActive = false;

      if(totalGames > numberOfGames)
      {
          bettingActive = false;

          console.log('Total Games reached succesfully. Setting betting flag to false.');
          engine.stop(); 
      }

      if(activationNumber == 0)
        bettingActive = true;
      
  } 
  else 
  {
      console.log('Current Game:', currentGame, 'LOST       : ', currentBet, ' Bust: ', bust, ', Balance: ', balance, ', Starting Balance: ', startingBalance, ' Profit: ', balance - startingBalance);
      currentGame++;
  }  
     
  if(currentGame >= betMatrix.length)
   {
     console.log('Lost the run: restarting game at 0');
     currentGame=0;
   }
  
});

function roundBit(bet) {
  return Math.round(bet / 100) * 100;
}

