var Parser 		= require('rss-parser');		// The library to parse RSS feeds
var fs 			= require('fs');				// To access the filesystem e.g. for database and config file
var sqlite3 	= require("sqlite3").verbose();	// The database engine
var feedInfos  	= require('./feeds.json');		// The configuration of the feeds and the keywords to trigger an alarm	
var config  	= require('./config.json');		// The app configuration holding e.g. the PushOver.net credentials
var request 	= require('request');			// To make a http request - here to send the notification using PushOver.net API


// Prepare database and launch the system
// =============================================================================

// Read the database file if exists or create table if not existing
var parser = new Parser();
var file 	= config.db_file;
var exists 	= fs.existsSync(file);
var db 		= new sqlite3.Database(file);
db.serialize(function() {
  if(!exists) {
    db.run("CREATE TABLE " +config.db_name +" ('feed', 'dTime', 'title', 'alarm' INTEGER, 'link' UNIQUE)"); //sqlite3 does not support booleans so Integer is used here
  }
});

// Process the feeds
var processFeeds = function() {
  feedInfos.forEach(function(feedInfo) {
        var feedUrl = feedInfo.url;
        parser.parseURL(feedUrl, function(err, rss) 
		{
			rss.items.forEach(function(entry) 
			{
				// Remove special characters from the title of the news to avoid problems saving it to the DB
				entry.title = entry.title.replace(/[^a-zA-Z ]/g, "");

				// Set the alarm to false as default for the given news
				let isAlarm = false;

				// Check if the keywords for the feed are included in the news
				feedInfo.keywords.forEach(function(keyword) 
				{
					isAlarm = entry.title.toLowerCase().includes(keyword);
					
					// Save or ignore the news if it is already saved in the DB
					let statement_insert = "insert or ignore into " +config.db_name +"  (feed, dTime, title, alarm, link) VALUES ('" +rss.title +"','" +entry.isoDate +"','" +entry.title +"',0,'" +entry.link+ "')";
					db.run(statement_insert);

					// If the alarm is triggered, send a notification if not done before
					if (isAlarm)
					{
						// See if an alarm has been sent before
						let statement_fired = "select distinct alarm from " +config.db_name +" where link = '" +entry.link +"'";
						db.each(statement_fired, (err, row) =>
						{
							if (err) throw err
							var fired = row.alarm;
							if (fired==0)
							{
								sendNotification(entry.title, entry.link);    
								let statement_update = "update " +config.db_name +"  set alarm = 1 where link =  '" +entry.link +"'";
								db.run(statement_update);
								console.log("Sent a notification, because " +keyword  +" was found in this news: (" +rss.title +") "+entry.title);	
							}
						});
					}
				});
			});
		});
	})

// Send a notification through the PushOver.net API
function sendNotification(message, url) {
	var messageObject = { 	"user"		: config.notification.user_id,
							"token"		: config.notification.app_token,
							"url"		: url,
							"url_title"	: "Read News",
							"message"	: message};
		request(
			{
				url		: "https://api.pushover.net/1/messages.json",
				method	: "POST",
				json	: true,
				body	: messageObject
			}, function (error, response, body){}
		);
	}
}    

// Start the process and rerun every 2 Minutes
setInterval(processFeeds, 120000);
console.log('RiSS started and checking the following news feeds every 2 minutes for items containing the given keywords');
console.log('==========================================================================================================');
feedInfos.forEach(function(feedInfo)
{
	console.log("Looking for: " +feedInfo.keywords);
	console.log("In " +feedInfo.url);
});