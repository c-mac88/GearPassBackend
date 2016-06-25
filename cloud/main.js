var API_KEY = "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";

var sendgrid = require('sendgrid').SendGrid(API_KEY);

Parse.Cloud.define('generateMembershipNumber', function(req, res) {


    var memberNumber;

    var users = new Parse.Query('User');
    users.count({
        success: function(response) {

            if (response < 10) {
                memberNumber = "00000" + response;
            } else if (response < 100) {
                memberNumber = "0000" + response;
            } else if (response < 1000) {
                memberNumber = "000" + response;
            } else {
                memberNumber = "00" + response;
            }

            var currentUser = req.user;
            console.log(memberNumber);
            currentUser.set('membership_number', memberNumber); // figure out a way to generate a random membership number
            currentUser.set('membership_number_confirmed', false)

            Parse.Object.saveAll([currentUser], { useMasterKey: true }).then(
                function(response) {
                    console.log(currentUser.get('email'));
                    var email = new sendgrid.Email();
                    email.addTo(currentUser.get('email'));
                    email.setFrom('noreply@gearpass.com');
                    email.setSubject("Membership Confirmation");
                    email.setHtml('Here is your new membership number for GearPass: ' + currentUser.get('membership_number'));

                    console.log(email);
                    sendgrid.send(email);

                    //     function(err, json) {
                    //     if (err) {
                    //         return res.error('Error sending email via SendGrid');
                    //     }
                    //     res.success('An email has been sent with your membership number.');
                    // });
                },
                function(err) {
                    console.log(err);
                }
            );

        },
        error: function(error) {
            console.log("error getting membership number");
        }
    });
});
