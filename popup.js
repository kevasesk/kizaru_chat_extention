let sendButton = document.getElementById("send");
let text = document.getElementById("text");

chrome.storage.sync.set({siteNumber: 0}, function() {
    console.log('INIT');
});

sendButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: main,
      args: [sendButton, text.value],
    });
  });

setInterval(function(){
    chrome.storage.sync.get(['siteNumber'], function(result) {
        if(result.siteNumber){
            sendButton.innerHTML = 'Sended...(Row:'+(result.siteNumber)+')';
            sendButton.classList.add('processed');
        }else{
            sendButton.innerHTML = 'Start';
            sendButton.classList.remove('processed');
        }
    });
},100);

function main(sendButton, messages) {
    if(typeof window.dsConnection == 'undefined'){
        window.dsConnection = new WebSocket('wss://ws.dream-singles.com/ws'); 
        //window.dsConnection = new WebSocket('ws://localhost:8081');
        window.dsConnection.onopen = function(e) {
            console.log("Connection established!");
        };
    }
    var intevalTime = 30 * 1000; // 30 * 1000 // TODO
    var messages = messages.split('\n');
    var siteProcessed = false;
    var siteInterval = null;
    var siteNumber = 0;
   
    messages = messages.filter(n => n);
    if(messages.length > 0 ){

        // invoke firsttime 
        setTimeout(function(){
            siteProcessed = true;
            window.dsConnection.send(JSON.stringify({
                type: 'start-auto-invite',
                payload: messages[siteNumber],
                block: true,
                ignore: true
            }));
            //console.log(messages[siteNumber]);
            chrome.storage.sync.set({'siteNumber': siteNumber+1}, function() {
                console.log('Value is set to ' + (siteNumber+1));
            });
            siteNumber++;
        }, 1000);
        
       

        // go from 2thd message to end
        siteInterval = setInterval(function(){
            
            if(siteNumber == messages.length){
                clearInterval(siteInterval);
                siteProcessed = false;
                siteNumber = 0;
                //console.log('set to 0 !!!');
                chrome.storage.sync.set({'siteNumber': 0});
            }else{
                if(messages[siteNumber]){
                    window.dsConnection.send(JSON.stringify({
                        type: 'start-auto-invite',
                        payload: messages[siteNumber],
                        block: true,
                        ignore: true
                    }));
                   // console.log(messages[siteNumber]);
                    chrome.storage.sync.set({'siteNumber': siteNumber+1}, function() {
                        console.log('Value is set to ' + (siteNumber+1));
                    });
                    
                    siteNumber++;
                }
            }
        }, intevalTime);
    }
}
