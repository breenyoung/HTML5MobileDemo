/**
 * Created by byoung on 7/9/2014.
 */

define(["jquery", "app/demo.globals"], function($, globals)
{
    "use strict";

    /*
        Localizes static controls and labels
     */
    var localizeApp = function()
    {
        var resourceFile = globals.getLocalizedResources();

        $("#tbUsername").attr("placeholder", (resourceFile["tbUsername"] === undefined) ? "Key not found" : resourceFile["tbUsername"]);
        $("#tbPassword").attr("placeholder", (resourceFile["tbPassword"] === undefined) ? "Key not found" : resourceFile["tbPassword"]);
        $("#btnNewItem").val((resourceFile["btnNewItem"] === undefined) ? "Key not found" : resourceFile["btnNewItem"]);
        $("#btnExistingItems").val((resourceFile["btnExistingItems"] === undefined) ? "Key not found" : resourceFile["btnExistingItems"]);
        $("#btnLogin").val((resourceFile["btnLogin"] === undefined) ? "Key not found" : resourceFile["btnLogin"]);
        $("#btnSubmitToServer").val((resourceFile["btnSubmitToServer"] === undefined) ? "Key not found" : resourceFile["btnSubmitToServer"]);
        $("#btnClearLog").val((resourceFile["btnClearLog"] === undefined) ? "Key not found" : resourceFile["btnClearLog"]);

        // General dialog
        $("#puDialog").find("a").text(resourceFile["global_ok"]);

        // About dialog
        $("#puAbout").find("div[data-role='header']").find("h1").text(resourceFile["hlAbout"]);

        // Headers
        var headers = $(globals.getFormId()).find("div[data-role='header']");
        headers.each(function(idx)
        {
            if($(this).data("sectionname"))
            {
                $(this).find("h1").text(resourceFile["global_appTitle"] + " - " + resourceFile[$(this).data("sectionname")]);
            }
            else
            {
                $(this).find("h1").text(resourceFile["global_appTitle"]);
            }

            $(this).find("a").text(resourceFile["global_menu"]);
            //console.log($(this));
        });

        // Panel navigation
        $("#hlAppHome").text((resourceFile["hlAppHome"] === undefined) ? "Key not found" : resourceFile["hlAppHome"]);
        $("#hlReview").text((resourceFile["hlReview"] === undefined) ? "Key not found" : resourceFile["hlReview"]);
        $("#hlActivityLog").text((resourceFile["hlActivityLog"] === undefined) ? "Key not found" : resourceFile["hlActivityLog"]);
        $("#hlLogoff").text((resourceFile["hlLogoff"] === undefined) ? "Key not found" : resourceFile["hlLogoff"]);
        $("#hlAbout").text((resourceFile["hlAbout"] === undefined) ? "Key not found" : resourceFile["hlAbout"]);

    };

    // Public method exposure
    var pub =
    {
        localizeApp: localizeApp
    };

    return pub;

});
