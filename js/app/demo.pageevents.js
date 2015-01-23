define(["jquery", "app/demo.globals", "app/demo.utility", "app/demo.ui"],
    function($, globals, utility, ui)
    {
        "use strict";

        var init = function()
        {
            // Handle 'pagecontainerbeforehide' events
            $(document).on("pagecontainerbeforehide", function(event, data)
            {
                //console.log("pagecontainerbeforehide fired");

                // Populate Review page with all values
                if(data.nextPage.attr("id") === "pgReview")
                {
                    ui.buildReview();
                }
                else if(data.nextPage.attr("id") === "pgDevTools")
                {
                    $("#tbDevLanguageFile").val(globals.getLanguageFile());
                    $("#tbDevFormFile").val(globals.getFormDefinitionFile());
                    $("#tbDevReportFile").val(globals.getReportFile());
                }
            });

            // Handle 'pagecontainerhide' events
            $(document).on("pagecontainerhide", function(event, data)
            {
                //console.log("pagecontainerhide fired");
            });

            // Handle 'pagecontainershow' events
            $(document).on("pagecontainershow", function(event, ui)
            {
                var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

                if(activePage.attr("id") === "pgError") { utility.hideLoader(); }

                var navLinks = $("#pnlNavGlobal").find("a");
                navLinks.each(function()
                {
                    /* Style hack for a fix in JQM for some other issue that removes 'ui-btn-active' class from hrefs on page change */
                    /* had to mimic it's style and implement my own */
                    if($(this).attr("href") === "#" + activePage.attr("id"))
                    {
                        $(this).addClass("demo-active-button");
                    }
                    else
                    {
                        $(this).removeClass("demo-active-button");
                    }
                });
            });

            // Handle 'pageshow' events
            $(document).on("pageshow", function()
            {

            });

        };

        // Public method exposure
        var pub =
        {
            init: init
        };

        return pub;

});
