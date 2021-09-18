var config = {
  numberOfGames: { value: 50000, type: 'number', label: '# of Games Before Shutdown' },
};

//Community Member: InstantFame Custom Game script.

var bettingActive = false; 
var activationNumber = 4; //activation number
var waitCashOut = 1.33; //activation wait cashout  aka when 4 games under 1.5 occur then start betting this matrix.


var startingBalance = userInfo.balance;
var currentBet = 0;
var activateGames = 0;
var currentGame = 0;
var totalGames = 0;
var wait=false;


//Game Matrix
let betMatrix = [
    [50, 1.33],
    [263, 1.33],
    [1400, 1.33],
    [7250, 1.33],
    
];

if(activationNumber == 0)
  bettingActive = true;

var startingBet = currentBet;

log('Script is running.... ');
log('Starting Balance: ', startingBalance);


engine.on('GAME_STARTING', onGameStarted);
engine.on('GAME_ENDED', onGameEnded);


function onGameStarted() 
{
  totalGames++;
     
  if(bettingActive)
  {
      //log('Game #', currentGame);
      //log('BetMatrix Length:', betMatrix.length);
      var currentBet = betMatrix[currentGame][0]*100;
      //log('Bet', currentBet);
      var cashOut = betMatrix[currentGame][1];
      log('Cashout', currentBet);

      log('Game #', currentGame, 'PLACE BET: ', roundBit(currentBet)/100, ' Cashout: ',  cashOut, ' User Balance: ', userInfo.balance/100);

      if (currentBet > userInfo.balance) {
          log('Game KILLED BET TO BIG');
          engine.removeListener('GAME_STARTING', onGameStarted);
          engine.removeListener('GAME_ENDED', onGameEnded);
      }
      else
      {
        if(currentBet != 0)
          engine.bet(roundBit(currentBet), cashOut); 
      }

      
  }
  else
  {
    log('Current Game:', currentGame, 'NO BET: User Balance: ', userInfo.balance/100);
  }

  
}

function onGameEnded() {
  var lastGame = engine.history.first()
  
  if (!lastGame.wager) {
        log('SKIP:', lastGame.bust, ' Betting Active: ', bettingActive);
        
        if(currentGame == 0)
        {
          if(lastGame.bust < waitCashOut)
          {
            activateGames++;

            if(activateGames == activationNumber)
            {
              bettingActive = true;
              log('Enabling Betting. Activation hit.');
            }
          
            return;
          }
          else
          {
            log('RESET WAIT.');
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
  //betting has to be active to reach here.
  if (lastGame.cashedAt) 
  {
      log('Current Game:', currentGame, 'WON : ', (lastGame.wager/100) * (lastGame.cashedAt), ' Bust: ', lastGame.bust, ', Balance: ', userInfo.balance/100, ', Profit: ', (userInfo.balance/100) - (startingBalance/100));
      currentGame=0;
      bettingActive = false;

      //log('config bet is', config.baseBet.value);
      //log('current bet is', currentBet);

      if(totalGames > config.numberOfGames.value)
      {
          bettingActive = false;

          log('Total Games reached succesfully. Shutting down.');
          engine.removeListener('GAME_STARTING', onGameStarted);
          engine.removeListener('GAME_ENDED', onGameEnded);
      }
      
  } 
  else 
  {
      log('Current Game:', currentGame, 'LOST       : ', lastGame.wager/100, ' Bust: ', lastGame.bust, ', Balance: ', userInfo.balance/100, ', Profit: ', (userInfo.balance/100) - (startingBalance/100));
      currentGame++;
  }   

     
  if(currentGame >= betMatrix.length)
   {
     log('Lost the run: restarting game at 0');
     currentGame=0;
   }

  if (userInfo.balance/100 < 1) {
    log('Game ended. Balance Below 10.');
    engine.removeListener('GAME_STARTING', onGameStarted);
    engine.removeListener('GAME_ENDED', onGameEnded);
  }

  
}


function roundBit(bet) {
  return Math.round(bet / 100) * 100;
}
