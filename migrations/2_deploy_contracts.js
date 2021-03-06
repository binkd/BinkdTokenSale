var BinkdToken   = artifacts.require("BinkdToken.sol");
var BinkdPrivatesale = artifacts.require("BinkdPrivatesale.sol");

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};
  
module.exports = function(deployer, network, accounts) {

    let startTime, endTime, ethRate, wallet, maxTokenSupply, presaleCap;
  
    if ( network == 'development' ) {
        startTime      = Date.now()/1000|0 + 60;
        //startTime      = 1518488400;
        endTime        = startTime + duration.weeks(1);
        ethRate        = new web3.BigNumber(100);
        wallet         = accounts[0];
        maxTokenSupply = 1000e18; //1000 is maxTokenSupply
        presaleCap     = 2000e18;
    } else {
        startTime      = 1520335800; //Tuesday March 06, 2018 11:30:00 (am) UTC
        endTime        = 1523014200; //Friday April 06, 2018 11:30:00 (am) UTC
        ethRate        = new web3.BigNumber(13300); //@1000USD to ETH, with 33% bonus
        wallet         = accounts[0];
        //625mn is a finite no of tokens that will not increase
        maxTokenSupply = 625000000e18; //max supply of 625mn tokens
        presaleCap     = 4000e18; //raise a max of 1500 ether @1000USD conversion, that's 2mn USD        
    }
    // deployer.deploy(BinkdToken, maxTokenSupply).then(function() {
    //     return deployer.deploy(BinkdPrivatesale, presaleCap, startTime, endTime, ethRate, wallet, BinkdToken.address);
    // });  
    deployer.then(function() {
        return deployer.deploy(BinkdToken, maxTokenSupply);
    }).then(function() { 
        console.log("BinkdToken address is : " + BinkdToken.address);
        return deployer.deploy(BinkdPrivatesale, presaleCap, startTime, endTime, ethRate, wallet, BinkdToken.address);
    }).then(function() {
        console.log("BinkdPrivatesale address is : " + BinkdPrivatesale.address);
        return BinkdToken.deployed();
    }).then(function(instance) { 
        console.log("BinkdToken instance is : " + instance.address);
        console.log("Transfering ownership to presale contract ...");
        return instance.transferOwnership(BinkdPrivatesale.address, {from: accounts[0]});
    });

};