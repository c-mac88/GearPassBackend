var sendgrid = require('sendgrid')(API_KEY); // find your api key from sendgrid, and paste it here

Parse.Cloud.define('hello', function(req, res) {
    res.success('Hi');
});

Parse.Cloud.define('generateMembershipNumber', function(req, res) {


    var memberNumber = "";

    var users = new Parse.Query('User');
    users.count({
        success: function(response) {
            console.log(response);

            if (response < 10) {
                memberNumber = "00000" + response;
            } else if (response < 100) {
                memberNumber = "0000" + response;
            } else if (response < 1000) {
                memberNumber = "000" + response
            } else {
                memberNumber = "00" + response
            }
        },
        error: function(error) {
            console.log("error getting membership number");
        }
    });


    var currentUser = req.user;

    currentUser.set('membership_number', memberNumber); // figure out a way to generate a random membership number
    currentUser.set('membership_number_confirmed', false)

    currentUser.save().then(
        function(response) {
            var email = new sendgrid.Email({
                to: currentUser.get('email'),
                from: 'noreply@gearpass.com',
                subject: 'Membership Confirmation',
                text: 'Here is your new membership number for GearPass: ' + currentUser.get('membership_number')
            });

            sendgrid.send(email, function(err, json) {
                if (err) {
                    return res.error('Error sending email via SendGrid');
                }
                res.success('An email has been sent with your membership number.');
            });
        },
        function(err) {
            console.log(err);
        }
    );
});
