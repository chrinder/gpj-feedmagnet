
// ----------------------
// json to HTML coversion
// ----------------------

// This is just a function that receives the json (data) of an update from FeedMagnet
// and returns a string of HTML to be displayed

jsonToHTML = function(update, _) {
    
    // use @usernames for Twitter users
    if (update.channel == 'twitter') update.author.alias = update.author.token;
    
    var media_width = 380;
    var type;
    
    // reusable stuff
    var timestamp = '<span class="fm-timestamp" data-timestamp="' + update.timestamp + '">' + _(update.timestamp).pretty_time() + '</span>';
    var via = 'via ' + update.channel;
    var channel_icon = '<img class="channel ' + update.channel + '" src="img/' + update.channel + '.png" />';
    var closeup = '</div><div class="corner ' + update.channel + '"><div class="shadow">' + channel_icon + '</div></div></div>';

    // checkins with text
    if (update.classification == 'checkin' && update.text) {
        html =  '<div class="big-checkin block"><div class="update">';
        html +=     '<div class="avatar"><img src="' + update.author.avatar + '" alt="' + update.author.token + ' avatar" /></div>';
        html +=     '<div class="content">';
        html +=         '<p class="checkin-text">';
        html +=             '<span class="name">' + update.author.alias + '</span>';
        html +=             ' // <span class="comment">' + update.text + '</span>';
        html +=         '</p>';
        html +=         '<p class="info">' + timestamp + ' via ' + channel_icon + '</p>';
        html +=     '</div>';
        html += '</div></div>';
        return html;
    }

    // checkins
    if (update.classification == 'checkin') {
        html =  '<div class="checkin block"><div class="update">';
        html +=     '<div class="avatar"><img src="' + update.author.avatar + '" alt="' + update.author.token + ' avatar" /></div>';
        html +=     '<div class="name">' + update.author.alias + '</div>';
        html +=     '<div class="info">' + timestamp + '</div>';
        html +=     '<div class="channel">' + channel_icon + '</div>';
        html += '</div></div>';
        return html;
    }
    
    // photo updates
    if (update.classification in {'photo':1, 'photoblurb':1}) {
        html =  '<div class="photo block"><div class="update">';
        html +=     '<img class="featured-photo" src="' + update.photos[0].local_url + media_width + '/' + (media_width - 30) + '/exact" />';
        html +=     '<div class="credits">';
        if (update.text.length) html +=     '<p class="content">' + update.text + '</p>';
        html +=         '<img class="avatar" src="' + update.author.avatar + '" alt="' + update.author.token + ' avatar" />';
        html +=         '<p class="from">' + update.author.alias + '</p>';
        html +=         '<p class="info">' + timestamp + '</p>';
        html +=     '</div>';
        html += closeup;
        return html;
    }
    
    // video updates
    if (update.classification in {'video':1, 'videoblurb':1}) {
        
        // add autoplay and wmode to the video embed code
        var code = video.code;
        var ins_point = false;
        if (video.origin == 'vimeo') ins_point = code.indexOf('" width=');
        if (video.origin == 'youtube') ins_point = code.indexOf('" frameborder=');
        if (ins_point) code = code.substr(0, ins_point) + '?autoplay=1&wmode=transparent' + code.substr(ins_point);
        
        html = '';
        html += '<div class="video block"><div class="update">';
        html += '   <span class="embed">' + code + '</span>';
        html += closeup;
        return html;
    }
    
    // fallback for everything else
    type = 'blurb';
    if (update.text.length < 100) type = 'big-blurb';
    if (update.text.length > 180) type = 'super-blurb';
    html =  '<div class="' + type + ' block"><div class="update">';
    html +=     '<div class="avatar"><img src="' + update.author.avatar + '" /></div>';
    html +=     '<div class="content">';
    html +=         '<p class="text">' + update.text + '</p>';
    html +=         '<p class="from">' + update.author.alias + '</p>';
    html +=         '<p class="info">' + timestamp + '</p>';
    html +=     '</div>';
    html += closeup;
    return html;
    
};