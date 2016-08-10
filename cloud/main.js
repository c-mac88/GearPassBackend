var API_KEY = "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";

var tokenId;

var memberNumber;

//generate member number based on number of current users
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

//Extend current user in DB to include new member number, send confirmation email
Parse.Cloud.define('generateMembershipNumber', function(req, res) {

    var currentUser = req.user;

    console.log(memberNumber);
    currentUser.set('membership_number', memberNumber);

    Parse.Object.saveAll([currentUser], { useMasterKey: true }).then(
        function(response) {
            console.log(response);
            console.log("response");
        },
        function() {
            console.log("whoops");
        }
    );

    var sg = require('sendgrid').SendGrid(API_KEY)
    var request = sg.emptyRequest()
    request.body = {

        "content": [{
            "type": "text/html",
            "value": "test"
        }],
        "from": {
            "email": "noreply@gearpass.com",
            "name": "Gear Pass"
        },
        "personalizations": [{
            "headers": {
                "X-Accept-Language": "en",
                "X-Mailer": "MyApp"
            },
            "subject": "Gear Pass Membership",
            "substitutions": {
                "%firstname%": currentUser.get('first'),
                "%membernumber%": currentUser.get('membership_number'),
            },
            "to": [{
                "email": currentUser.get('email'),
                "name": currentUser.get('first')
            }]
        }],
        "subject": "Gear Pass Membership",
        "template_id": "ba2f734f-35e8-40dc-a6fe-fa34ae6b5c1f",

    }
    request.method = 'POST'
    request.path = '/v3/mail/send'
    sg.API(request, function(response) {
        console.log(response.statusCode)
        console.log(response.body)
        console.log(response.headers)
    })
});

//email sent to users when they submit a rental request
Parse.Cloud.define('requestMail', function(req, res) {

    var currentUser = req.user;
    var data = req.params;

    var sg = require('sendgrid').SendGrid(API_KEY)
    var request = sg.emptyRequest()
    request.body = {

        "content": [{
            "type": "text/html",
            "value": "test"
        }],
        "from": {
            "email": " noreply@adventurepass.com",
            "name": "Adventure Pass"
        },
        "personalizations": [{
            "headers": {
                "X-Accept-Language": "en",
                "X-Mailer": "MyApp"
            },
            "subject": "Welcome to Adventure Pass!",
            "substitutions": {
                "%firstname%": data.first
            },
            "to": [{
                "email": data.email,
                "name": data.first
            }]
        }],
        "subject": "Welcome to Adventure Pass!",
        "template_id": "b6cbbc48-9e3c-4e6d-9b59-c42e3e88953c",
    }
    request.method = 'POST'
    request.path = '/v3/mail/send'
    sg.API(request, function(response) {
        console.log(response.statusCode)
        console.log(response.body)
        console.log(response.headers)
    })

});

//get the Stripe token for user's credit card info, ceate new customer
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
