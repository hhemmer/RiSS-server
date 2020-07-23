# Read it Simple, Stupid! - RiSS, pro-active edition

# What is it good for?
## Get notified when keywords are found in your news feeds
Define a set of news feeds and keywords for these feeds to trigger a notification on your smartphone incl. a direct link to the news item.

### Examples
To get notified if there are news on the Corona virus, you can for example configure RiSS to check a news feed for that topic:
```shell
Sent a notification, because corona was found in this news: (Deutsche Welle) Coronavirus latest Global infections top  million
Sent a notification, because corona was found in this news: (Deutsche Welle) Coronavirus How Germanys economy would cope with a second wave
Sent a notification, because corona was found in this news: (Deutsche Welle) COVID Travel Diaries On tour in Germany in times of coronavirus
```

Maybe you are interested in Apple developer news regarding the Apple Watch or the iPhone? Get informed when Apple publishes Watch-related and iPhone-related news in its developer news channel:
```shell
Sent a notification, because watch was found in this news: (News - Apple Developer) How to design an accessible Apple Watch app
Sent a notification, because watch was found in this news: (News - Apple Developer) Design a great inapp purchase experience for Apple Watch
Sent a notification, because iphone was found in this news: (News - Apple Developer) Submit Your iPhone Apps to the AppnbspStore
Sent a notification, because iphone was found in this news: (News - Apple Developer) Building Adaptive User Interfaces for iPhone andnbspiPad
Sent a notification, because watch was found in this news: (News - Apple Developer) Submit Your watchOS Apps to the AppnbspStore
```

# Requirements
## Software
* [Node.js](https://nodejs.org/)
  * SQLite
  * RSS-Parser
  * Request
## Service (essential for push notifications)
- PushOver (to receive push notifications on iOS and Android devices, currently about 5 Euros one-time payment). Information about their API and registration is available at [PushOver.net](https://pushover.net/)

# Installation
Download the content to a directory of choice. Run 
```
npm install
```
Now all dependencies should be installed and you can launch the system by executing
```
npm start
```
When started, the system will display the feeds and keywords, e.g.:
```shell
RiSS started and checking the following news feeds every 2 minutes for items containing the given keywords
==========================================================================================================
Looking for: corona
In http://rss.dw.com/rdf/rss-en-all
Looking for: watch,iphone
In http://developer.apple.com/news/rss/news.rss
```

## PushOver Service
You can register for an account at [PushOver.net](https://pushover.net/) and test the service for 7 days. After registration you will get a user id and can setup an application for your specific workflow and one for your generic timer at PushOver that will be the target for your push notifications. The app will have a token to be included in your requests to their API as shown later in configuration. More options are found at the [PushOver API documentation](https://pushover.net/api)

# Configuration
The _config.json_ file is used to configure the system. It holds the configuration of messages, locale and the pushover account information.
```javascript
    {
	"notification" :                                    // Notification related data
		{
			"app_token"   : "abcde123",                 // PushOver App ID for your primary workflow
			"generic_app" : "fghij456",                 // The App ID of the generic timer app 
			"user_id"     : "klmno789",                 // Your PushOver.net user ID
		},	
	"db_name"   : "feeds",                              // SQLite database name of choice
	"db_file"   : "feeds.db",                           // Preferred name of the database file
    }
```
The feeds and keywords to trigger notifications are stored in the _feeds.json_ file as an object array like this one:
```javascript
    [
        {
            "url": "http://rss.dw.com/rdf/rss-en-all",
            "keywords": ["corona"]
        },
        {
            "url": "http://developer.apple.com/news/rss/news.rss",
            "keywords": ["watch", "iphone"]
        }
    ]
```
