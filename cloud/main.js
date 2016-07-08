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
            // "bcc": [{
            //     "email": "sam.doe@example.com",
            //     "name": "Sam Doe"
            // }],
            // "cc": [{
            //     "email": "",
            //     "name": ""
            // }],
            // "custom_args": {
            //     "New Argument 1": "New Value 1",
            //     "activationAttempt": "1",
            //     "customerAccountNumber": "[CUSTOMER ACCOUNT NUMBER GOES HERE]"
            // },
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

Parse.Cloud.define('requestMail', function(req, res) {

    var currentUser = req.user;
    var data = req.params;
    console.log(data.email);

    var sg = require('sendgrid').SendGrid(API_KEY)
    var request = sg.emptyRequest()
    request.body = {

        "content": [{
            "type": "text/html",
            "value": "test"
        }],
        "from": {
            "email": " noreply@gearpass.com",
            "name": "Gear Pass Requests"
        },
        "personalizations": [{
            // "bcc": [{
            //     "email": "",
            //     "name": ""
            // }],
            // "cc": [{
            //     "email": "",
            //     "name": ""
            // }],
            // "custom_args": {
            //     "New Argument 1": "New Value 1",
            //     "activationAttempt": "1",
            //     "customerAccountNumber": "[CUSTOMER ACCOUNT NUMBER GOES HERE]"
            // },
            "headers": {
                "X-Accept-Language": "en",
                "X-Mailer": "MyApp"
            },
            "subject": "Gear Pass Request",
            "substitutions": {
                "%firstname%": currentUser.get('first'),
                "%message%": data.message,
                "%gear%": data.gear,
                "%shopname%": data.name
            },
            "to": [{
                "email": currentUser.get('email'),
                "name": currentUser.get('first')
            }]
        }],
        "subject": "New Request",
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
