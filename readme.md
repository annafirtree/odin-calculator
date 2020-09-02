**INTRO**


This is Anna Macdonald's completion of The Odin Project's [Calculator Project](https://www.theodinproject.com/courses/web-development-101/lessons/calculator).

See the [Calculator here](https://annafirtree.github.io/odin-calculator/).

**FEATURES**

* As per the extra credit, the page allows both button and keyboard input.
* The page allows a variety of non-standard input, like the letter x for multiplication and [ ] or { } for parentheses.
* The project called for a simple left-to-right calculation, but I instead implemented PEMDAS.
* The project called for a "clear" button, with a "backspace" button being extra credit. I implemented a backspace button that acts like a clear button if pressed right after the "=" is pressed.
* As per the other extra credits, I gave it a simple, attractive appearance and made the user unable to enter two decimals in the same number.
* The instructions called for a snarky error message if you divide by 0; I did not implement a *snarky* one, but this and a variety of other errors (like entering "6+((") will produce a backwards-E.


**THINGS LEARNED**

Along with the usual process of running into unanticipated problems in the logic flow and going back to account for them, here are some of the more notable problems I ran into, and the solutions I found:

.

**Problem**: I tried saving the input in simple string format and then using spaces to parse it into an array, but this quickly became a nightmare of nested while loops and un-entanglable logic. 

**Solution**: Instead I made a global variable that is an array of objects and parsed the content into the array as the user enters it. I also made a global variable to track which index in the array the code was currently working at. I'm not certain it's good practice to use top-level variables like that, but it worked.

.

**Problem**: Sometimes pushing the Enter/Return button made it act like the enter button was pressed twice, instead of only once. (This was especially noticeable because at the time, hitting Enter on a completed calculation resulted in an error notification.) Also, once or twice I thought I caught it adding an extra (previously-typed) number when I hit Enter; this turned out to be the same problem. This problem was very difficult to track down, because it didn't happen every time, and therefore was difficult to reproduce and figure out where it came from.

**Solution**: I put some console.logs in my listeners and eventually figured out that it happened when I first clicked buttons with the mouse and then input more content by keyboard and hit Enter. The problem stemmed from the fact that the last-clicked button was still highlighted and active after switching to keyboard, so in addition to triggering the keyboard listener, hitting the Enter key also triggered the button listener. I solved this by putting "event.preventDefault();" in the keyboard listener for the Enter key. (And also stuck an if-loop somewhere to get rid of the problem where hitting Enter twice resulted in an error.)

.

**Problem**: I expected typing letters to do nothing, but instead they erased the default "0", which made the display screen shrink (because it was empty). I eventually figured out why. To avoid crashing because of running tests on nonexistent objects, my code first created an object with empty values and then deleted it if necessary. Entering a letter triggered the object creation without triggering any of the deletes, so the display function's "if the array is empty, display 0" clause wasn't triggering.

**Solution**: At first I tried to solve this by listing out by hand all the acceptable inputs in the listener. But this seemed unnecessarily clunky and limiting, so I changed it back and instead put another if-empty-then-delete bit into the relevant part of the handling function (the default of the switch statement in 'updateSequence').

.

**Problem**: Deleting elements from an array while looping forward through it would cause major glitches, so for any loop that potentially deletes items as it goes, I loop from the end back toward the beginning. Because of this, my code, after figuring out which operations were the highest priority, was evaluating those operations from right to left. (That is, 9/3+8/2 would do the 8/2 first, then the 9/3, then add the results on the next loop.) This wasn't a problem for any other operations (exponents in 2^3^2 form don't have an established reading that I'm aware of, so I just put a note about how my code handled it), but I belated realized this would cause problems for subtraction. (9-5-2 should be parsed as (9-5)-2 = 2, not as 9-(5-2)=6). 

**Solution**: When assigning which precedences to give to operations, I put in a new variable that counted down from the max-length of the input, to force higher precedences on leftward variables. This seems clumsy, but I couldn't think of a simpler or more elegant solution. It also made my "find multiple indices at highest precedence" code unnecessary, since they can't be at the same precedence anymore, but I didn't bother to change that.

**OTHER THOUGHTS**

I learned that Array.slice does not include the end index in the slice.

I used global CONSTANTS for the division and other signs that are not regular keyboard inputs, since I didn't want to have to keep copy-pasting them into my code. But this made me wonder if it's a better practice to also define + and ^ as global constants, even though I didn't need to. It didn't seem to make a huge difference in readability to not define those, but it would have felt more consistent to do so.

My "operate" function is called in the while-loop inside "evaluateSequence". There's several errors that operate looks for, and if it catches one of those, it returns 'error' so that evaluateSequence knows to break the while loop. But if it doesn't return an error, then it doesn't need to actually return anything, since it's doing the operation directly on the global sequence array. I'm not sure if the best practice here involves not having a return statement, returning an empty string, or returning a placeholder string like 'valid' (for readability, but useless in the actual code);

The original instructions from Odin called for add/divide/multiply/subtract functions, themselves called by an operate function. Once I actually had my code running, this seemed so absolutely unnecessary that I deleted them and changed my switch statement to doing the operations directly.
