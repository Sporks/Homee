##Instructions
Just connect to the bot through the page as usual

There is just one POST endpoint, and that is for the webhook.  All the database queries and bot interaction is through here.

To retrieve the data by the user ID (the sender ID from the facebook messenger bot), just connect to yourURL.com/<userID>
There is a generic route to handle this.

#Issues
One thing I cannot seem to get working is getting the response ("thank you") to appear before the next question.
I tried it with resolving promises, but it runs asynchronously
