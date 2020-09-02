const DIVIDE = "\u00f7";
const MULTIPLY = "\u00d7";
const TIMES = '×';
const BACKSPACE = '⌫';
const SUBTRACT = '−';
const MAX_LENGTH = 37;


let sequence = [];
let currentIndex = 0;
setListeners();


// Event listeners

function setListeners(){
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button=>{
        button.addEventListener('click', ()=>{
            updateSequence(button.textContent);
        })
    })
    window.addEventListener('keydown', (event)=>{
        switch(event.key){
            case '-':
            case '_':
                updateSequence(SUBTRACT);
                break;
            case 'x':
            case '*':
                updateSequence(MULTIPLY);
                break;
            case '/':
            case '\\':
                updateSequence(DIVIDE);
                break;
            case 'Enter':
                event.preventDefault();
                updateSequence('=');
                break;
            case 'Backspace':
                updateSequence(BACKSPACE);
                break;
            case '(':
            case '[':
            case '{':
                updateSequence('(');
                break;
            case ')':
            case ']':
            case '}':
                updateSequence(')');
                break;
            case ',':
                updateSequence('.');
                break;
            default:
                updateSequence(event.key);
                break;
        }
    })
}



// Primary functions

function updateSequence(buttonPressed){
    if (sequence.length !=0){
        let printableSequence = sequence.reduce((string, item)=> string + item.value,'');
        if (printableSequence.length > MAX_LENGTH && buttonPressed != BACKSPACE) return;
    }
    let thisType = 'paren';
    if(sequence[currentIndex] == null){
        sequence[currentIndex] = {value:'', type:'', flag:''};
    }
    let currentValueAsString = sequence[currentIndex].value;
    switch(buttonPressed){
        case '+':
        case SUBTRACT:
        case DIVIDE:
        case TIMES:
        case '^':
            thisType = 'operator';
        case '(':
        case ')':
            if(sequence[currentIndex].type == 'number'){
                currentIndex++;
            }
            sequence[currentIndex] = {value:buttonPressed, type:thisType, flag:''};
            currentIndex++;
            break;
        case BACKSPACE:
            if (sequence[currentIndex].type == 'number' && currentValueAsString.length > 1 && sequence[currentIndex].flag != 'calculated'){ 
                sequence[currentIndex].value = currentValueAsString.slice(0,currentValueAsString.length - 1);
            }else{
                sequence.pop();
                if (currentValueAsString = ""){
                    sequence.pop();
                }
                currentIndex--;
                if (currentIndex < 0){ 
                    currentIndex = 0; 
                }
            }
            break;
        case '.':
            if (currentValueAsString.indexOf('.') != -1){
                break;
            }
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '0':
            thisType = 'number';
            currentValueAsString = sequence[currentIndex].value + buttonPressed;
            sequence[currentIndex] = {value:currentValueAsString, type:thisType, flag: ''};
            break;
        case '=':
            if(currentValueAsString == ''){
                sequence.pop();
            }
            evaluateSequence();
            currentIndex = 0;
            break;
        default:
            if(currentValueAsString == ''){
                sequence.pop();
                currentIndex--;
            }
            break;
    }
    displaySequence();
}



function evaluateSequence(){
    //don't return error if someone hit enter after not typing enough
    if(sequence.length == 1){
        sequence[0].flag = 'calculated';
        return; 
    }
    if (sequence.length < 1){
        return;
    }
    assignPrecedences();
    let done = false;
    while (!done){
        //reduce any "(num)" situations to "num"
        for(let i=sequence.length-2; i>0; i--){
            if(sequence[i-1].value == '(' && sequence[i+1].value == ')'){
                replaceThreeObjectsWithOne(i);
            }
        };
        //find indices of highest precedence
        let highestPrecedence = 0;
        let indicesAtHighestPrecedence = [];
        for (let i=0; i<sequence.length;i++){
            let thisPrecedence = sequence[i].flag;
            if(thisPrecedence > highestPrecedence){
                highestPrecedence = thisPrecedence;
                indicesAtHighestPrecedence = [i];
            }else if(thisPrecedence == highestPrecedence){
                indicesAtHighestPrecedence.push(i);
            }
        }
        // catch error if no operations
        if(indicesAtHighestPrecedence.length == 0 && sequence[0].flag != 'calculated'){
            handleError();
            done = true;
        }
        //do the highest precedence operations
        for (let i=indicesAtHighestPrecedence.length-1; i>=0; i--){
            let result = operate(indicesAtHighestPrecedence[i]);
            if (result == 'error') return;
        }
        if(sequence.length < 2){
            done = true;
        }
    }
    sequence[0].flag = 'calculated';
    sequence[0].value = shorten(sequence[0].value);
}





// Helpful sub-functions


function displaySequence(){
    const displayElement = document.querySelector("#display");
    if(sequence.length == 0){
        displayElement.textContent = '0';
    }else if(sequence[0].flag == 'error'){
        displayElement.textContent = 'Ǝ';
    }else{
        displayElement.textContent = sequence.map(element => element.value).join("");
    }
}

function operate(index){
    // catch some errors
    if(sequence[index].type != 'operator') {
        handleError();
        return 'error';
    }
    if(sequence[index+1] == null || sequence[index-1] == null){
        handleError();
        return 'error';
    }
    let num1 = +sequence[index-1].value;
    let num2 = +sequence[index+1].value;
    if(isNaN(num1) || isNaN(num2)){
        handleError();
        return 'error';
    }
    // do the operation
    let result = 0;
    switch (sequence[index].value){
        case '+':
            result = num1+num2;
            break;
        case SUBTRACT:
            result = num1-num2;
            break;
        case DIVIDE:
            if (num2 == 0){
                handleError();
                return 'error';
            }
            result = num1/num2;
            break;
        case MULTIPLY:
            result = num1*num2;
            break;
        case '^':
            result = num1**num2;
            break;
        default:
            result = 'error'
            break;
    }
    // put the result in the sequence and update
    sequence[index] = {value:result.toString(), type:'number', flag:''};
    replaceThreeObjectsWithOne(index);
    return 'noterror';
}

/* Loop through the sequence to assign a precedence to each operation, counting parentheses on the way. 
    See assignPrecedence(), the next function, for more details on precedence order.
*/
function assignPrecedences(){
    let parenCount = 0;
    let preserveLefttoRight = MAX_LENGTH;
    for (let i=0; i<sequence.length; i++){
        switch (sequence[i].type){
            case 'paren':
                switch(sequence[i].value){
                    case '(':
                        parenCount++;
                        break;
                    case ')':
                        parenCount--;
                        break;
                    default:
                        break; 
                }
                break;
            case 'operator':
                sequence[i].flag = assignPrecedence(sequence[i].value, parenCount, preserveLefttoRight);
            default:
                break;
        }
        preserveLefttoRight--;
    }
}

/* each factor gets multiplied by a different order of magnitude to preserve
    its relative importance in the ordering. Parentheses matters most, so it 
    gets multiplied by 1000, then order-of-operations by 100, then left-to-right 
    will (clumsily) count down from max-length, and therefore be in the 10s or 1s.
*/
function assignPrecedence(operator, parenCount, preserveLefttoRight){
    let operatorFactor = 0;
    switch(operator){
        case '+':
        case SUBTRACT:
            operatorFactor = 1;
            break;
        case MULTIPLY:
        case DIVIDE:
            operatorFactor = 2;
            break;
        case '^':
            operatorFactor = 3;
            break;
        default:
            break;
    }
    return parenCount*1000 + operatorFactor*100 + preserveLefttoRight;
}


// More sub-functions

function handleError(){
    sequence = [{value:'', type:'', flag: 'error'}];
}

// limits to 2 decimals
function shorten(string){
    let shorterString = string;
    let decimalIndex = string.indexOf('.');
    let hasDecimal = (decimalIndex == -1) ? false : true;
    let eIndex = string.indexOf('e');
    let hasE = (eIndex == -1) ? false : true;
    if (hasDecimal){
        shorterString = string.slice(0,decimalIndex+3);
    }
    if (hasE){
        shorterString += string.slice(eIndex);
    }
    return shorterString;
}

function replaceThreeObjectsWithOne(index){
    sequence.splice(index+1,1);
    sequence.splice(index-1,1);
}
