define(["jquery", "app/demo.globals", "app/demo.utility"], function($, globals, utility)
{
    "use strict";

    var authenticateUser = function(username, password, errorFunction, successFunction)
    {
        $.ajax({
            url: "http://localhost:21761/api/Users?username=" + username + "&password=" + password,
            dataType: "json",
            type: "GET",
            error: errorFunction,
            success: successFunction
        });

    };

    // Public method exposure
    var pub =
    {
        authenticateUser: authenticateUser
    };

    return pub;


});
