/**
 * Created by byoung.
 */
require.config({

    paths:
    {
        "jquery": "thirdparty/jquery",
        "jquerymobile": "thirdparty/jquery.mobile-1.4.3.min",
        "moment": "thirdparty/moment.min",
        "sjcl": "thirdparty/sjcl.min",
        "mustache": "thirdparty/mustache",
        "gritter": "thirdparty/jquery.gritter.min",
        "powertimers": "thirdparty/jquery.powertimers",
        "jqscribble": "thirdparty/jquery.jqscribble",
        "spin": "thirdparty/spin.min",
        "mobiscroll": "thirdparty/mobiscroll",
        "sprintf": "thirdparty/sprintf",
        "validate": "thirdparty/jquery.validate",
        "mockjax": "thirdparty/jquery.mockjax",
        "jqgrid": "thirdparty/jqgrid",

        "app": "app"
    }
    ,
    shim:
    {
        "sjcl":
        {
            exports: "sjcl"
        },
        "gritter":
        {
            exports: "gritter"
        },
        "powertimers":
        {
            exports: "powerTimer"
        },
        "jqscribble":
        {
            exports: "jqScribble"
        },
        "mobiscroll":
        {
            exports: "scroller"
        },
        "mockjax":
        {
            exports: "mockjax"
        },
        "jqgrid":
        {
            exports: "jqxGrid,jqxButton"
        }
    }
    /*
     ,
     shim:
     {
     "backbone":
     {
     "deps": ["underscore", "jquery"],
     "exports": "Backbone"
     }
     }
     */
});

require(["jquery", "spin"], function($, Spinner)
{
    var spinner =  new Spinner().spin();
    $("#divLoader").append(spinner.el);
});

require(["jquery", "app/demo.bootstrap"], function($, bootstrap)
{
    bootstrap.initLocalization();

    $(document).on("mobileinit",

        // Set up the "mobileinit" handler before requiring jQuery Mobile's module
        function()
        {

            $.mobile.selectmenu.prototype.options.hidePlaceholderMenuItems = false;

            // Prevents all anchor click handling including the addition of active button state and alternate link bluring.
            //$.mobile.linkBindingEnabled = false;

            // Disabling this will prevent jQuery Mobile from handling hash changes
            //$.mobile.hashListeningEnabled = false;

            // Get message resources for culture.
            // This has to be done prior to JQM's form 'enhancement' as it can sometimes improperly render controls with empty text labels
            // (specifically checkbox and radios)
        }
    )

    require(["jquerymobile"], function()
    {
        bootstrap.init();
    });
});
