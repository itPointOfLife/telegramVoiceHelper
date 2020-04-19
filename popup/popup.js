window.onload = function() {

    chrome.storage.sync.get("tgSettings", function(result) {
        let commandValue = [];

        if (result.tgSettings) {

            for (let i = 0; i < COMMANDKEY.length; i++) {

                const value = result.tgSettings[COMMANDKEY[i]];

                if(value && value != '') {
                    commandValue[i] = value;
                } else if (value != COMMANDVALUE[i]) {

                    commandValue[i] = COMMANDVALUE[i];
                }

                document.querySelector(`ul li input[name='${COMMANDKEY[i]}']`).value = commandValue[i];
            }
        } else {
            commandValue = COMMANDVALUE;

            for (let i = 0; i < COMMANDKEY.length; i++) {
                
                document.querySelector(`ul li input[name='${COMMANDKEY[i]}']`).value = COMMANDVALUE[i];
            }
        }

        const updValue = (e)=>{

            const customInput = e.target;
            const customValue = customInput.value.toLowerCase();

            if(customValue && customValue!=''){

                for (let i = 0; i < commandValue.length; i++) {

                    if(customInput.name == COMMANDKEY[i] && commandValue[i] != customValue){

                        const curInput = document.querySelector(`ul li input[name='${COMMANDKEY[i]}']`);
                        
                        curInput.value = customValue;
                        commandValue[i] = customValue;
                        
                        chrome.storage.sync.get("tgSettings", function(result) {
                            
                            if(result.tgSettings)
                            {

                                let newObj = result.tgSettings;
                                newObj[customInput.name] = customValue;

                                chrome.storage.sync.set({"tgSettings":newObj}, function(){
                                    console.log('Storage updated - ', customInput.name, ' : ', customValue)
                                });
                            } else {

                                chrome.storage.sync.set({"tgSettings":{[customInput.name]:customValue}}, function(){
                                    console.log('Storage updated - ', customInput.name, ' : ', customValue)
                                });
                            }

                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                                chrome.tabs.sendMessage(tabs[0].id, {message: {'name':customInput.name, 'value':customValue}});
                            });
                        });
                        
                        curInput.parentElement.querySelector("label input").checked = true;

                        const timeout = ms => {
                            return new Promise(resolve => setTimeout(resolve, ms));
                        }

                        const cheboxDelay = async () => {
                            await timeout(1000);
                            curInput.parentElement.querySelector("label input").checked = false;
                        }

                        cheboxDelay()

                        i = commandValue.length;
                    }            
                }
            }
        }

        document.querySelectorAll("ul li input").forEach( input => input.addEventListener("focusout", updValue));
        document.querySelectorAll("ul li input").forEach( input => input.addEventListener("keypress", (e)=>{
            if(e.keyCode == 13) 
                updValue(e);
            }
        ));

    });
}
        