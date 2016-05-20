##Instructions
Just connect to the bot through the page as usual

There is just one POST endpoint, and that is for the webhook.  All the database queries and bot interaction is through here.

To retrieve the data by the user ID (the sender ID from the facebook messenger bot), just connect to yourURL.com/<userID>
There is a generic route to handle this.

I also implimented generic message templates to allow the user to review their responses.  Becuase of the character limit, each response is on a different bubble

#Issues
One thing I cannot seem to get working is getting the response eg ("thank you") to appear before the next question.
I tried it with resolving promises, but it still runs asynchronously.
This is due ot the async nature of the request module.

Either heroku or the facebook api is a little slow sometimes and doesnt respond immediately, I am trying to figure out why this is
