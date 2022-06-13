let sendButton = document.getElementById("send");
let text = document.getElementById("text");

let sendButton2 = document.getElementById("send2");
let text2 = document.getElementById("text2");

sendButton.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: main,
      args: [sendButton, text.value],
    });
  });

sendButton2.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: main,
        args: [sendButton2, text2.value],
    });
});

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
                payload: messages[0],
                block: true,
                ignore: true
            }));
            // if(siteProcessed){
            //     sendButton.innerHTML = 'Sended...(Row:'+(siteNumber+1)+')';
            //     sendButton.classList.add("processed");
            // }else{
            //     sendButton.innerHTML = 'Start';
            //     sendButton.classList.remove("processed");
            // }
            
            siteNumber++;
        }, 1000);
       

        // go from 2thd message to end
        siteInterval = setInterval(function(){
            if(messages[siteNumber]){
                window.dsConnection.send(JSON.stringify({
                    type: 'start-auto-invite',
                    payload: messages[siteNumber],
                    block: true,
                    ignore: true
                }));
                if(siteNumber == messages.length){
                    clearInterval(siteInterval);
                    siteProcessed = false;
                    siteNumber = 0;
                }
                // if(siteProcessed){
                //     sendButton.innerHTML = 'Sended...(Row:'+(siteNumber+1)+')';
                //     sendButton.classList.add("processed");
                // }else{
                //     sendButton.innerHTML = 'Start';
                //     sendButton.classList.remove("processed");
                // }
                siteNumber++;
            }
        }, intevalTime);
    }
}
