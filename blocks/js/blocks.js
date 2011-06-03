
// ------------------------------------
// run masonry when the browser resizes
// ------------------------------------

$(document).ready(function() {
    $(window).bind('smartresize', function() {
        $('#fm-output').masonry({ 'columnWidth': 100, 'animate': true, 'resizeable': false });
    });
});

blocks = function($, _, vars) {

    // create new feed object
    var feed = $FM(vars.feeds);
    
    // establish default variables that can be overridden
    feed.poll_wait = vars.poll_wait || 30;
    feed.poll_limit = vars.poll_limit || 20;
    feed.animateSpeed = vars.animateSpeed || 2;
    feed.output = vars.output;
    feed.auto = window.location.search.substring(1);
    feed.initialized = false;
    
    // a few CSS tweaks for when we're doing the auto-animation - "?auto" at end of URL
    if (feed.auto) {
        $('body').css('overflow', 'hidden');
        $('#bottom-padding').css('height', 500);
    }
            
    // add html to each new update and append to the html_queue string
    feed.html_queue = '';
    feed.connect('new_update', {
        'callback': function(self, data) {
            data.update.html = vars.jsonToHTML(data.update.data, _);
            if (feed.auto) {
                self.html_queue = data.update.html + self.html_queue;
            } else {
                self.html_queue += data.update.html;
            }
        }
    });
    
    // once all updates have been received from a get request, run the display method
    feed.connect('get_success', {
        'callback': function(self, data) {
            self.display_queue();
        }
    });
    
    // display updates once we have a new batch ready to go
    feed.waiting = false;
    feed.display_queue = function() {
        
        // if we're still waiting for images to load, try again a little later
        if (feed.waiting) {
            setTimeout(feed.display_queue, 1000);
            return false;
        }
        
        // do we have anything new to show?
        if (feed.html_queue == '') {
            return false;
        }
        
        // add the content to the page, but keep it hidden until ready
        feed.$append = $(feed.html_queue).fadeTo(0, 0);
        $(feed.output).append(feed.$append);
        feed.html_queue = '';
        
        // find and tag the photos that need loading - if there are any, set wait to true
        var $photos = feed.$append.find('.featured-photo');
        $photos.addClass('image-loading');
        if ($photos.length > 0) {
            feed.waiting = true;
        } else {
            feed.sort_and_show();
        }
        
        // each time a photo is loaded, remove the tag and check to see if that was the last one
        // if it was the last one, we're done loading and can show the page.
        $photos.load(function() {
            $(this).removeClass('image-loading');
            if(feed.$append.find('.image-loading').length == 0) feed.sort_and_show();
        });
        
        // if we got an error loading a featured photo, remove the entire update
        $photos.error(function() {
            $(this).parent().remove();
            if(feed.$append.find('.image-loading').length == 0) feed.sort_and_show();
        });
        
        // if we get an error loading avatar images, just remove the avatar
        feed.$append.find('.avatar img').error(function() { $(this).remove(); });
        
        return true;
    };
    
    // have masonry place the new updates accordinly and then fade them in
    feed.sort_and_show = function() {
        feed.waiting = false;
        if (feed.initialized) {
            $(feed.output).masonry({'appendedContent': feed.$append, 'columnWidth': 100});
        } else {
            $(window).trigger('smartresize');
            feed.initialized = true;
        }
        if (feed.auto) {
            feed.$append.addClass('waiting');
            feed.show_next();
        } else {
            feed.$append.fadeTo(200, 1);
        }
    };
    
    // show the next hidden update, and continue doing so until there are no more to show
    feed.current_scroll = 0;
    feed.show_next = function() {
        
        // get the next hidden update
        var $update = $('.waiting:first');
        
        // if needed, scroll the page down so that update will be visible
        var scroll_target = $update.offset().top + $update.height() - $(window).height() + 20;
        if (scroll_target > feed.current_scroll) {
            $('html, body').animate({scrollTop: scroll_target }, (feed.animateSpeed * 1000 * 0.8));
            feed.current_scroll = scroll_target;
        }
        
        // fade in the update and then move on to show the next, if there are more
        $update.fadeTo(feed.animate_speed, 1, function() {
            $(this).removeClass('waiting');
            if ($('.waiting').length) feed.show_next();
        });
        
    };
            
    // set up polling based on our wait time (we only need a single get if we're not in auto mode)
    if (feed.auto) {
        feed.poll({ 'wait': feed.poll_wait, 'limit': feed.poll_limit });
    } else {
        feed.get({ 'limit': feed.poll_limit * 2 });
    }

};
