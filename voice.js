const reg = new (window.SpeechRecognition 
    || window.webkitSpeechRecognition 
    || window.mozSpeechRecognition 
    || window.msSpeechRecognition)();

reg.lang = "ru-RU";

let commandValue = [],
    storageFlag = false,
    voiceFlag = false,
    breakLineFlag = false;

chrome.storage.sync.get("tgSettings", function(result) {

    if (result.tgSettings) {

        for (let i = 0; i < COMMANDKEY.length; i++) {

            const value = result.tgSettings[COMMANDKEY[i]];

            if(value && value != '') {

                commandValue[i] = value;
            } else if (value != COMMANDVALUE[i]) {

                commandValue[i] = COMMANDVALUE[i];
            }
        }
    } else {
        commandValue = COMMANDVALUE;
    }

    storageFlag = true;
});

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
   sendResponse({msg:'Delivered to content'});
   
   for (let i = 0; i < COMMANDKEY.length; i++) {

       if (COMMANDKEY[i] === request.message.name) {

           commandValue[i] = request.message.value;
       } 
   }
});

window.onload = function() {
    reg.start();
}

reg.onend = function(){
    reg.start();
};

reg.onresult = function(event){

    if(storageFlag){

        // str result
        const transcript = event.results[0][0].transcript.toLowerCase();

        const notificationAnimation = messageBox => {

            const upDownAnimation = down => {

                const start = Date.now();

                const timer = setInterval(function() {

                    let timePassed = Date.now() - start;

                    if (timePassed > 1000) {

                        timePassed = 1010;
                        clearInterval(timer);
                    }

                    if(down) {

                        messageBox.style.top = Math.ceil(timePassed/10) - 100 + 'px';
                    } else {

                        messageBox.style.top = Math.ceil(timePassed/-10) + 'px';
                    }

                }, 20);
            }

            const timeout = ms => {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            (async () => {
                upDownAnimation(true)
                await timeout(2000);
                upDownAnimation(false);
            })();
        }

        const notification = typeNotification => {

            let msg, bgColor, textColor, strokeCOlor, messageBox;

            const notificationElement = document.querySelector("#voiceTelegramNotification");

            if (!notificationElement) {

                messageBox = document.createElement('div');
            } else {

                messageBox = notificationElement;
            }

            if(typeNotification === "activate") {

                msg = "Voice helper activated"; 
                bgColor = "#08ca43";
                textColor = "#ffffff";
                strokeColor = "rgba(255,255,255,0.5)";

                messageBox.setAttribute("id", "voiceActivateNotification")
            } else {

                msg = "Voice helper deactivated"; 
                bgColor = "#ffd800";
                // textColor = "#000000";
                // strokeColor = "rgba(1,1,1,0.2)";
                textColor = "#ffffff";
                strokeColor = "rgba(0,0,0,.35)";

                messageBox.setAttribute("id", "voiceDeactivateNotification")
            }

            messageBox.innerHTML = msg;
            messageBox.style.cssText = `min-width: 300px; height: 100px; background:${bgColor}; border-radius: 5px; position: absolute; z-index: 999; text-align: center; left: calc(50% - 150px); top: -100px; display: flex; color: ${textColor}; font-size: 18px; justify-content: center; align-items: center; font-weight: bold; -webkit-text-stroke: 1px ${strokeColor};`;
            
            document.body.insertBefore(messageBox, document.body.firstChild);

            notificationAnimation(messageBox);
        }

        // activate recording
        if(transcript == commandValue[0] && !voiceFlag){

            notification("activate");
            voiceFlag = true;
            return;
        }

        // deactivate recording
        if(transcript == commandValue[1] && voiceFlag){

            notification("deactivate");
            voiceFlag = false;
            return;
        }

        if(voiceFlag){


            // send message
            if(transcript == commandValue[2]){

                document.querySelector( "button[type='submit']" ).dispatchEvent(new Event('mousedown', { bubbles: true}));
            }
            // break line
            else if(transcript == commandValue[3]){

                document.querySelector('.composer_rich_textarea').innerHTML += '<br>';
                breakLineFlag = true;
            }
            else{
                
                if(breakLineFlag) {

                    document.querySelector('.composer_rich_textarea').innerHTML += transcript;
                    breakLineFlag = false;
                }
                else document.querySelector('.composer_rich_textarea').innerHTML += ' ' + transcript;
            }
        }
    }
};