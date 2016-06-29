var API_KEY = "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";

var tokenId;

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
        };
    },
    error: function(error) {
        console.log("error getting membership number");
    }
});

Parse.Cloud.define('generateMembershipNumber', function(req, res) {

    var currentUser = req.user;

    console.log(memberNumber);
    currentUser.set('membership_number', memberNumber); // figure out a way to generate a random membership number

    Parse.Object.saveAll([currentUser], { useMasterKey: true }).then(
        function(response) {
            console.log(response);
            console.log("response");
        },
        function() {
            console.log("whoops");
        }
    );


    var helper = require('sendgrid').mail
    from_email = new helper.Email("noreply@gearpass.com")
    to_email = new helper.Email(currentUser.get('email'))
    subject = "GearPass Membership"
    content = new helper.Content("text/plain", "Here is your new membership number for GearPass: " + currentUser.get('membership_number'))
    mail = new helper.Mail(from_email, subject, to_email, content)
    template

    var sg = require('sendgrid').SendGrid(API_KEY)
    var requestBody = mail.toJSON()
    var request = sg.emptyRequest()
    request.method = 'POST'
    request.path = '/v3/mail/send'
    request.body = requestBody
    sg.API(request, function(response) {
        console.log(response.statusCode)
        console.log(response.body)
        console.log(response.headers)
    })
});

Parse.Cloud.define('requestMail', function(req, res) {

    // var currentUser = req.user;
    // var data = req.params;
    // console.log(data.email);

    // // console.log(memberNumber);
    // // currentUser.set('membership_number', memberNumber); // figure out a way to generate a random membership number

    // var helper = require('sendgrid').mail
    // from_email = new helper.Email("noreply@gearpass.com")
    // to_email = new helper.Email(currentUser.get('email'))
    // subject = "Gear Request"
    // content = new helper.Content("text/plain", "Thank you for requesting " + data.quantity + " " + data.gear + " your request will be answered shortly")
    // mail = new helper.Mail(from_email, subject, to_email, content)

    // var sg = require('sendgrid').SendGrid(API_KEY)
    // var requestBody = mail.toJSON()
    // var request = sg.emptyRequest()
    // request.method = 'POST'
    // request.path = '/v3/mail/send'
    // request.body = requestBody
    // sg.API(request, function(response) {
    //     console.log(response.statusCode)
    //     console.log(response.body)
    //     console.log(response.headers)
    // })


    var currentUser = req.user;
    var data = req.params;
    console.log(data.name);

    console.log(memberNumber);
    currentUser.set('membership_number', memberNumber); // figure out a way to generate a random membership number

    var helper = require('sendgrid').mail
    from_email = new helper.Email("noreply@gearpass.com")
    to_email = new helper.Email(data.email)
    subject = "Shop Request"
    content = new helper.Content("text/plain", currentUser.get('First') + "Requested " + data.quantity + " " + data.gear + ". Please reply.")
    mail = new helper.Mail(from_email, subject, to_email, content)

    var sg = require('sendgrid').SendGrid(API_KEY)
    var requestBody = mail.toJSON()
    var request = sg.emptyRequest()
    request.method = 'POST'
    request.path = '/v3/mail/send'
    request.body = requestBody
    sg.API(request, function(err, json) {
        if (err) {
            return res.error('Error sending email via SendGrid');
        }
        res.success('An email has been sent to ' + data.email + '.');
    });
});


Parse.Cloud.define('collectPaymentInformation', function(req, res) {

    var stripe = require("stripe")("pk_test_qVOqOhnaihK12calHXo8wgQM");
    var stripeSK = require("stripe")("sk_test_IgaqbKa01DwCOGvS5AzI1MH8");
    stripe.tokens.create({
        card: {
            "number": req.params.number,
            "exp_month": req.params.month,
            "exp_year": req.params.year,
            "cvc": req.params.cvc
        }
    }, function(err, token) {
        console.log(token.id);
        tokenId = token.id;
    });

    console.log(tokenId);

    stripeSK.customers.create({
        description: 'new GearPass customer',
        source: tokenId // obtained with Stripe.js
    }, function(err, customer) {
        console.log(customer);
    });


});
