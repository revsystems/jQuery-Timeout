/*
Copyright (c) 2010 RevSystems, Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

The end-user documentation included with the redistribution, if any, must 
include the following acknowledgment: "This product includes software developed 
by RevSystems, Inc (http://www.revsystems.com/) and its contributors", in the 
same place and form as other third-party acknowledgments. Alternately, this 
acknowledgment may appear in the software itself, in the same form and location 
as other such third-party acknowledgments.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
(function($){
    // for scoping our entry into $.data()
    var rand = Math.floor(Math.random()*9999999);
    function uniq(id) { return id + ".to" + rand; }
    
    // onCancel/onComplete are optional
    $.fn.timeout = function( id, delay, onTimeout, onCancel, onComplete ) {
        
        // try a timeout for each matched element. use the matched element for the context in the timeouts
        function doTimeout(isInterval) {
            var toid, $e = $(this);
            
            // if this timeout is already active and we're not running an interval, debounce it
            if($e.data(uniq(id)) && !isInterval) {
              $e.cancelTimeout(id);
            }
            
            // set the timeout for real
            toid = setTimeout(function() {
            
                // if the try function returns true, treat this as an interval
                if(onTimeout.call($e[0]) === true) {
                    doTimeout.call($e[0], true);
                }
                
                // call the finally function if the timeout/interval is terminating
                else if(onComplete) {
                    onComplete.call($e[0]);
                }
                
                // cleanup
                if(!isInterval) { 
                  $e.removeData(uniq(id));
                }
            }, delay);
            
            // store the data for this timeout
            $e.data(uniq(id), {
                'toid': toid,
                'onTimeout': onTimeout,
                'onCancel': onCancel,
                'onComplete': onComplete
            });
        }
        return $(this).each(doTimeout);
    };
    
    // cancel and force are basically the same, except they execute different functions
    // this does the dirty work for both
    function endTimeout( ids, calls ) {
        // ids can be an array or a string of ids delimited by spaces
        ids = $.isArray(ids) ? ids : ids.split(/\s+/);
        
        // clear timeouts, call the appropriate functions for each id, and cleanup
        return $(this).each(function() {
            var i, j, id, to, $e = $(this);
            for(i=0; i < ids.length; i++) {
              id = ids[i];
              to = $e.data(uniq(id));
              if(to) {
                  clearTimeout(to.toid);
                  for(j=0; calls && j < calls.length; j++) {
                    if(to[calls[j]]) { to[calls[j]].call( $e[0] ); }
                  }
                  $e.removeData(uniq(id));
              }
            }
        });
    }
    
    // cancel all timeouts listed in ids
    $.fn.cancelTimeout = function( ids ) {
        return endTimeout.call(this, ids, ["onCancel", "onComplete"] );
    };
    
    // force all timeouts listed in ids
    $.fn.forceTimeout = function( ids ) {
        return endTimeout.call(this, ids, ["onTimeout", "onComplete"] );
    };

    // sugar up some syntax for global (window scoped) timeouts
    $.each(["timeout", "cancelTimeout", "forceTimeout"], function(i, funcName) {
      $[funcName] = function() {
        return $.fn[funcName].apply(window, arguments);
      };
    });
    
}(jQuery));