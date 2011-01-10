# jQuery-Timeout

Developer-friendly timeouts with jquery chaining, debouncing, element context, and the 
ability to gracefully handle timeout cancelling.

Many ideas for this plugin were taken from
[http://benalman.com/projects/jquery-dotimeout-plugin/](Ben Alman's doTimeout plugin), 
which is excellent in its own right. I made my own version because I have my own 
function definition preferences and I wanted onCancel/onComplete functionality built in.

# Demo

You can see some examples [here](http://dl.dropbox.com/u/124192/websites/jquerytimeout/index.html).

## Features

  * Simplify your complicated timeouts and intervals
  * Set local DOM timeouts, or global, whatever makes sense
  * Easy debouncing
  * Optional onCancel/onComplete functions
  
## Compatibility

jQuery-Timeout has been tested in the following browsers:
  
  * Firefox 3.6.12
  * Google Chrome 8.0.552.224
  * IE7 (via IE9 beta)
  * IE8 (via IE9 beta)
  * IE9 beta
  
It requires [jQuery version 1.3.x](http://jquery.com) and up.

## Usage

Requires [jQuery](http://jquery.com) and this plugin.

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
    <script type="text/javascript" src="jquery.timeout.js"></script>
    
### Function Definitions

    timeout( id, delay, onTimeout[, onCancel[, onComplete]] )
    
    cancelTimeout( id )
    
    forceTimeout( id )

### Local Timeouts

By scoping to a DOM element, multiple timeouts can be created at once. In the example below, two timeouts 
will be set for each element with a "my_div" class. These timeouts can be individually cancelled or forced.

    $(".my_div").timeout("my_timeout_id1", 1000, function() {
      // etc...
    });
    $(".my_div").timeout("my_timeout_id2", 1000, function() {
      // etc...
    });
    $(".my_div:first").cancelTimeout("my_timeout_id1");
    $(".my_div:last").forceTimeout("my_timeout_id2");
    
### Optional onCancel and onComplete Functions

These functions are built in a try/catch/finally pattern. That is, (1) you try to execute the timeout
function, (2) you execute some code if you catch a cancellation, (3) you finally execute some code 
no matter what.

I find this pattern useful because I often combine animations and delays, with some arbitrary state 
being set at the end. I want this state set no matter what, even if the user decides to do something 
that cancels the animation. I can accomplish this by performing cleanup actions with onCancel and 
ensuring the desired state is set in onComplete.

    $(".my_div").timeout("my_timeout_id", 1000, function() {
      // steps to perform on a successful timeout
    }, function() {
      // steps to perform on cancel
    }, function() {
      // steps to perform either after cancel or after a succesful timeout
    });

### Debouncing

Debouncing is the process of consolidating many errant signals into just one. In Javascript UI 
work, this often means cancelling a timeout and starting a new one when the user interacts with 
the page very quickly.

jQuery-Timeout tries to make this easy. You set a timeout and an ID. If you set another timeout 
with the same ID, the old timeout is cancelled and the new one takes its place. Simple.

    $(".my_div:first").timeout("my_timeout_id", 1000, function() {
      // steps to perform on a succesful timeout
    }, function() {
      alert("cancelled");
    }, function() {
      alert("complete");
    });

    $(".my_div:first").timeout("my_timeout_id", 1000, function() {
      alert("The earlier timeout will be cancelled because I started a new one with the same ID.");
    });
    
Note that, because you are essentially cancelling the old timeout, debouncing WILL cause the 
onCancel and onComplete functions to be called. 
    
### Global Timeouts

Global timeouts work exactly the same as local timeouts, but they assume window as the object.
The unscoped version below is just syntactic sugar for the local syntax $(window).timeout(...)

    $.timeout("timeout_id1", 1000, function() {
      // etc...
    });
    $.timeout("timeout_id2", 1000, function() {
      // etc...
    });
    $.cancelTimeout("timeout_id1");
    $.forceTimeout("timeout_id2");
    
### Polling Timeouts

If your timeout function returns true, the timeout will loop. The loop can be stopped using 
cancelTimeout or by returning anything besides true in the function.

If true is not returned, it is assumed the timeout has completed successfully, and the onComplete 
function is executed.

    var loopCount = 0;
    $("#my_div").timeout("my_timeout_id1", 1000, function() {
      if(loopCount == 10) {
        alert("we've looped 10 times. now stop.");
        return false;
      }
      loopCount++;
      return true;
    });