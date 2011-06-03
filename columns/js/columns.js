columns = function($, _, vars) {

    // --------------
    // Output Display
    // --------------
    
    // initialize arrays to hold stuff
    var feeds = [];
    var looping_feeds = [];
    var feed_index = 0;
    var queue = [];
    var banners = [];
    
    // keep track of output columns and use them in pseudo random order, ensure each gets used equally
    var $columns = $('.fm-column');
    $columns.append('<div class="fm-holder"></div>');
    var columns_available = $columns.slice(0);
    var next_column = function() {
        if (columns_available.length == 1) {
            columns_available = $columns.slice(0);
            return columns_available[0];
        }
        return columns_available.splice(Math.floor(Math.random() * columns_available.length), 1)[0];
    };
    
    // get the next update to show (either from queue or looping)
    var next_update = function() {
        if (queue.length) {
            return queue.shift();
        } else if (looping_feeds.length) {
            if (looping_feeds[feed_index] == undefined) return false;
            var update = looping_feeds[feed_index++].get_next();
            if (feed_index >= looping_feeds.length) feed_index = 0;
            return update;
        } else {
            return false;
        }        
    };
    
    // display an update in a column
    var showUpdate = function(update, $column) {
        
        // add the update to the column
        var html = '<div class="fm-js-update-wrapper fm-hidden">' + update.html + '</div>';
        var updates;
        var u;
        if ($column.hasClass('fm-top')) {
            $column.find('.fm-holder').prepend(html);
            updates = $column.find('.fm-js-update-wrapper');
            u = updates.first();
            if (updates.length > 10) {
                updates.last().remove();
            }
        } else if ($column.hasClass('fm-bottom')){
            $column.find('.fm-holder').append(html);
            updates = $column.find('.fm-js-update-wrapper');
            u = updates.last();
            if (updates.length > 10) {
                updates.first().remove();
            }
        }
        
        // animate in the update to display it
        u.hide();
        setTimeout(function() {
            u.slideDown('slow', function() {
                u.removeClass('fm-hidden');
                u.fadeTo(0,0).fadeTo('slow', 1);
            });
        }, 3000); // we're waiting 3 seconds here to give images a chance to load
    };
    
    // set up loop to show an update every X seconds
    var animateSpeed = vars.animateSpeed || 2;
    var stream = function() {
        var update = next_update();
        var column = next_column();
        if (update && column) showUpdate(update, $(column));
        setTimeout(stream, animateSpeed * 1000);
    };
    stream();


    // ---------------------
    // Feeds from FeedMagnet
    // ---------------------
    
    // extend Feed object to add a get_next method for use with looping 
    $FM.Feed.mixin({
        'get_next': function(self) {
            self.loop_index = self.loop_index || 0;
            if (self._updates.length == 0) return false;
            var update = self._updates[self.loop_index++];
            if (self.loop_index >= self._updates.length) self.loop_index = 0;
            return update;
        }
    });
    
    // loop over the feed settings passed in and set up each Feed object
    var i;
    for (i = 0; i < vars.feeds.length; i++) {

        // create the new feed object
        feeds.push($FM.Feed(vars.feeds[i].groups));
        
        // set some sensibe defaults for looping, pollWait, pollLimit, and cssClass
        feeds[i].looping = vars.feeds[i].looping || false;
        feeds[i].pollWait = vars.feeds[i].pollWait || false;
        if (!feeds[i].pollWait) feeds[i].pollWait = feeds[i].looping ? 60 : 20;
        feeds[i].pollLimit = vars.feeds[i].pollLimit || false;
        if (!feeds[i].pollLimit) feeds[i].pollLimit = feeds[i].looping ? 50 : 10;
        feeds[i].cssClass = vars.feeds[i].cssClass || 'default';

        // if this is a looping feed, add it to the list
        if (feeds[i].looping) looping_feeds.push(feeds[i]);
        
        // set up signal to run each new update received through
        // the jsonToHTML function passed in to vars and display it
        feeds[i].connect('new_update', function(self, data) {
            data.update.data.cssClass = self.cssClass;
            data.update.html = vars.jsonToHTML(data.update.data, _);
            queue.push(data.update);
        });
        
        // initiate polling
        feeds[i].poll({
            'wait': feeds[i].pollWait,
            'limit': feeds[i].pollLimit
        });
        
    }
    
    
    // -------------
    // Banner Images
    // -------------
    
    // set up new Banner object to handle banner graphics
    var Banner = function(init) {

        // settings passed at initialization
        this.frequency = init.wait_minutes || 2;
        this.bannerClass = init.bannerClass || 'fm-banner';

        // create a fake update object for the banner
        this.update = new Object();
        this.update.data = new Object();
        this.update.data.id = 'promo' + Math.floor(Math.random(0)*9999999999999999999).toString();
        this.update.html = '<div class="' + this.bannerClass + '"><img src="' + init.image + '" /></div>';

        // start streaming
        this.stream();
        
    };
    Banner.prototype = {
        
        // stream stuff to the display
        'stream': function() {
            queue.push(this.update);
            var self = this;
            setTimeout(function() { self.stream(); }, self.frequency * 60 * 1000);
        },    
        
        'toString': function() {
            return 'Banner';
        }
    };
    
    // loop over banner settings passed in and make new banner objects
    vars.banners = vars.banners || false;
    if (vars.banners) {
        for (i = 0; i < vars.banners.length; i++) {
            banners.push(new Banner(vars.banners[i]));
        }
    }
    
    
    // -------------------
    // Pretty time syncing
    // -------------------

    // keeps pretty time (e.g. 1 minute ago) up to date when displayed for more than one minute
    // requires markup like this: <div class="fm-timestamp" data-timestamp="1234567">1 minute ago</div>
    // note that our underscore library mixin does the heavy lifting the actual pretty time conversion

    var underscore = _; // we need access to underscore inside the function below
    var update_pretty_time = function(_) {
        $('.fm-timestamp').each(function(i) {
            $(this).empty().append(underscore($(this).attr('data-timestamp')).pretty_time());
        });
        setTimeout(update_pretty_time, 1000); // run this once a second
    };
    update_pretty_time();
    
};