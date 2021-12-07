var config = {
  numberOfGames: { value: 5000, type: 'number', label: '# of Games Before Shutdown' },
};

//YouTube Tutorial: https://youtu.be/j3OSs_mam_8

var bettingActive = false; 
var activationNumber = 2; //activation number
var waitCashOut = 1.2; //activation wait cashout  aka when 4 games under 1.2 occur then start betting this matrix.


//Game Matrix
let betMatrix = [
    [100, 1.3],     //100 BET , 1.3 Payout - GAME #1
    [600, 1.3],     //600 BET , 1.3 Payout - GAME #2
    [1800, 1.5],    //1800 BET , 1.5 Payout - GAME #3
    [6000, 1.5],    //6000 BET , 1.5 Payout  - GAME #4
    [12000, 1.8],  //12000 BET, 1.8 Payout - GAME #5

];

var startingBalance = userInfo.balance;
var currentBet = 0;
var activateGames = 0;
var currentGame = 0;
var totalGames = 0;
var wait=false;


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

    
      if(activationNumber == 0)
        bettingActive = true;
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

