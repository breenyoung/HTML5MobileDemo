/**
 * Created by byoung on 7/3/2014.
 */

define(["jquery", "moment", "app/demo.globals", "app/demo.utility", "app/demo.localization", "app/demo.ui", "app/demo.data.websql", "app/demo.data.indexeddb", "app/demo.timers", "app/demo.formparser", "app/demo.pageevents", "thirdparty/jquery.mockjax"],
    function($, moment, globals, utility, localization, ui, webSql, indexedDb, timers, formParser, pageevents, mockjax)
{
    "use strict";

    var init = function()
    {
        // Redefine datepicker functions to use moment.js
        //Date.parseDate = function( input, format ){ console.log("here"); return moment(input,format).toDate(); };
        //Date.prototype.dateFormat = function( format ){ return moment(this).format(format); };

        $("#tbLog").val("");
        $("#puAbout").enhanceWithin().popup();
        $("#puDialog").enhanceWithin().popup();
        $("#puTCs").enhanceWithin().popup();
        //$("body>[data-role='panel']").panel();
        $("#pnlNavGlobal").panel();


        if(globals.isDeveloperMode())
        {
            // Setup mockajax for developer mode
            $.mockjax({
                url: "*/api/Users?username*",
                type: "GET",
                responseTime: 500,
                status: 200,
                responseText: null
            })
        }

        // When indexedDB available, use it
        indexedDb.init(
            function indexedDBSuccess()
            {
                utility.p("IndexedDB support found");
                globals.setDataLayer(indexedDb);
                initFormAndSystem();
            },
            function indexedDBFailure() // When indexedDB is not available, fallback to trying websql
            {
                utility.p("IndexedDB support not found");
                webSql.init(
                    function webSQLSuccess()
                    {
                        utility.p("WebSQL support found");
                        globals.setDataLayer(webSql);
                        initFormAndSystem();
                    },
                    function()
                    {
                        // No suitable local storage found, do something meaningfull here
                        utility.p("No suitable local storage found");
                        utility.showPopupMessage("No suitable local storage found");
                    }
                );
            }
        );
    };

    var initFormAndSystem = function()
    {
        pageevents.init();
        timers.init();
        formParser.init();

        $.ajax({
            url: globals.getFormDefinitionFile(),
            dataType: "json",
            type: "GET",
            error: function(jqxhr, errorCode)
            {
                utility.p("Error retrieving form definition: " + errorCode);
                //utility.navigateToPage("#pgError");
                utility.showErrorPage();
            },
            success: function(data, status)
            {
                formParser.parseFormDefinition(data);
                ui.init();

                // Prefetch pages for UI responsiveness
                var prefetchPages = globals.getFormPages();
                for(var i = 0; i < prefetchPages.length; i++)
                {
                    $(":mobile-pagecontainer").pagecontainer("load", prefetchPages[i], { showLoadMsg: false } );
                }

                utility.hideLoader();


                utility.p("Culture: " + globals.getCulture());
                utility.p("Is Online: " + utility.isOnline());
                utility.p("Landscape mode: " + utility.isLandscape());
                utility.p("Application initialization complete, Version: " + globals.getVersion() + ", Production Mode: [" + globals.isProduction() + "]");
            }
        });
    };

    var initLocalization = function()
    {
        var resourceFile = globals.getLanguageFile();
        $.ajax({
            url: resourceFile,
            dataType: "json",
            type: "GET",
            error: function(jqxhr, errorCode)
            {
                utility.p("Error retrieving language file: " + errorCode);
            },
            success: function(data, status)
            {
                globals.setLocalizedResources(data);

                // Localize the static portions of the form
                localization.localizeApp();
            }
        });
    };

    // Public method exposure
    var pub =
    {
        init: init,
        initLocalization: initLocalization
    };

    return pub;

});
