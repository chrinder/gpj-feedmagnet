
// ----------------------
// json to HTML coversion
// ----------------------

// This is just a function that receives the json (data) of an update from FeedMagnet
// and returns a string of HTML to be displayed

jsonToHTML = function(update, _) {
    var media_width = 480;
    
    // reusable snippets
    var details = '';
    details += '<div class="fm-details">';
    details += '    <span class="fm-timestamp" data-timestamp="' + update.timestamp + '">' + _(update.timestamp).pretty_time() + '</span>';
    details += '    via ' + update.author.channel;
    details += '</div>';
    
    var avatar = '<div class="fm-avatar"><img src="' + update.author.avatar + '" /></div>';
        
    // video
    if (update.classification == 'video' || update.classification == 'videoblurb') {
        var video = update.videos[0];
    
        // add autoplay and wmode to the video embed code
        var code = video.code;
        var ins_point = false;
        if (video.origin == 'vimeo') ins_point = code.indexOf('" width=');
        if (video.origin == 'youtube') ins_point = code.indexOf('" frameborder=');
        if (ins_point) code = code.substr(0, ins_point) + '?autoplay=1&wmode=transparent' + code.substr(ins_point);
    
        // now, finally, generate the html
        html = '';
        html += '<div class="fm-update fm-video fm-' + update.cssClass + '">';
        html += '   <span class="fm-embed"' + code + '</span>';
        html += '</div>';
        return html;
    }

    // photo
    if (update.classification == 'photo' || update.classification == 'photoblurb') {
        html = '';
        html += '<div class="fm-update fm-photo fm-' + update.cssClass + '">';
        html += '   <img src="' + update.photos[0].local_url + media_width + '" />';
        html += '</div>';
        return html;
    }

    // article
    if (update.classification == 'article') {
        html = '';
        html += '<div class="fm-update fm-article fm-' + update.cssClass + '">';
        html += '   <div class="fm-text fm-highlight">' + update.text + '</div>';
        html += '   <div class="fm-details">' + update.teaser + '</div>';
        html += '</div>';
        return html;
    }

    // checkin
    if (update.classification  == 'checkin') {
        
        // if the teaser text starts with the authors name, wrap a span around it so we can change its color
        if (update.teaser && update.teaser.indexOf(update.author.alias) === 0) {
            update.teaser = '<span class="fm-author fm-highlight">' + update.author.alias + '</span>' + update.teaser.substr(update.author.alias.length);
        }
        
        html = '';
        html += '<div class="fm-update fm-checkin fm-' + update.cssClass + '">';
        html +=     avatar;
        html += '   <div class="fm-content">';
        html += '       <span class="fm-teaser">' + update.teaser + '</span>';
        if (update.text != null) html += '| <span class="fm-text">' + update.text + '</span>';
        html +=         details;
        html += '   </div>';
        html += '</div>';
        return html;
    }

    // trim text to not be crazy long - used by both the blurb themes below
    if (update.text.length > 150) update.text = update.text.substring(0,140) + "...";

    // large blurb (short amount of text, displayed with big font)
    if (update.text.length < 100) {
        html = '';
        html += '<div class="fm-update fm-hugeblurb fm-' + update.cssClass + '">';
        html += '   <div class="fm-content">';
        html += '       <span class="fm-text fm-highlight">' + update.text + ' </span>';
        html += '   </div>';
        html +=     avatar;
        html += '   <div class="fm-info">';
        html += '       <div class="fm-author">' + update.author.alias + ': </div>';
        html +=         details;
        html += '   </div>';
        html += '</div>';
        return html;
    }
    
    // default fall-back format (for blurb, link)
    html = '';
    html += '<div class="fm-update fm-blurb fm-' + update.cssClass + '">';
    html +=     avatar;
    html += '   <div class="fm-content">';
    html += '       <div class="fm-text"><span class="fm-author fm-highlight">' + update.author.alias + ': </span>' + update.text + ' </div>';
    html +=         details;
    html += '   </div>';
    html += '</div>';
    return html;

};
