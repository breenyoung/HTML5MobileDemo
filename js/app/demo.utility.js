/**
 * Created by byoung on 6/27/2014.
 */

define(["jquery", "moment", "gritter", "app/demo.globals"], function($, moment, gritter, globals)
{
    "use strict";

    var stickyGrowlIds = [];

    var navigateToPage = function(pageName, data)
    {
        $.mobile.navigate(pageName);

        if(data)
        {
            if(data.action)
            {
                switch(data.action)
                {
                    case "popup":
                        $("#puDialog").enhanceWithin().popup();
                        $("#puDialog").popup("open");
                        break;
                }
            }
        }
    };

    var removeStickyGrowls = function()
    {
        for(var i = 0; i < stickyGrowlIds.length; i++)
        {
            $.gritter.remove(stickyGrowlIds[i]);
        }
    };

    var makeGrowl = function(text, opts)
    {
        var title = globals.getLocalizedResources()["global_genericDialogTitle"];
        var time = 6000;
        var sticky = false;

        if(opts)
        {
            if(opts.sticky) { sticky = opts.sticky ;}
            if(opts.time) { time = opts.time ;}
            if(opts.title) { title = opts.title ;}
        }

        var gritterId = $.gritter.add({
            // (string | mandatory) the heading of the notification
            title: title,
            // (string | mandatory) the text inside the notification
            text: text,
            time: time,
            sticky: sticky
        });

        if(sticky)
        {
            stickyGrowlIds.push(gritterId);
        }
    };

    var guid = function()
    {
        function s4()
        {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return function()
        {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
    }();

    var serializeFormData = function(form)
    {
        var o = {};
        var a = $(form).serializeArray();

        $.each(a, function()
        {
            if(this.name !== "tbLog" && this.name !== "tbUsername" && this.name !== "tbPassword")
            {
                if (o[this.name] !== undefined)
                {
                    if (!o[this.name].push)
                    {
                        o[this.name] = [o[this.name]];
                    }

                    o[this.name].push(this.value || '');
                }
                else
                {
                    o[this.name] = this.value || '';
                }
            }
        });

        return o;
    };

    var isLandscape = function()
    {
        if(window.orientation === 0 || window.orientation === 180)
        {
            return false;
        }

        return true;
    };

    var isOnline = function()
    {
        if(navigator.onLine)
        {
            return true;
        }

        return false;
    };

    var printToActivityWindow = function(message)
    {
        $("#tbLog").val($("#tbLog").val() + "\n" + "[" + moment().format() + "] " + message);
    };

    var printMessage = function(message, level)
    {
        if(globals.isDeveloperMode()) { printToActivityWindow(message); }

        if(!globals.isProduction())
        {
            if(typeof (console) !== "undefined")
            {
                switch(level)
                {
                    case "info":
                        console.info(message);
                        break;
                    case "warn":
                        console.warn(message);
                        break;
                    case "debug":
                        console.debug(message);
                        break;
                    case "error":
                        console.error(message);
                        break;
                    default:
                        console.log(message);
                        break;
                }
            }
        }
    };

    var showPopupMessage = function(message, title)
    {
        $("#puDialogTitle").text((title) ? title : globals.getLocalizedResources()["global_genericDialogTitle"]);
        $("#puDialogText").text(message);

        $("#puDialog").popup("open");
    };

    var toggleItemSpecificUi = function(action)
    {
        if(action === "hide") { $("#pnlNavGlobal .itemSpecific").hide(); }
        else { $("#pnlNavGlobal .itemSpecific").show(); }
    };

    var clearForm = function()
    {
        printMessage("Clearing form");

        $("#tbUsername").val("");
        $("#tbPassword").val("");

        // Clear signature surfaces
        $("canvas").each(function(idx)
        {
            var elemId = $(this).attr("id");

            if($(this).data("jqScribble") && $(this).data("jqScribble") !== null)
            {
                $(this).data("jqScribble").clear();
            }
        });

        var cbs = $("input:checkbox");
        cbs.checkboxradio();
        //$("input[type='radio']").checkboxradio("refresh");
        cbs.prop("checked", false).checkboxradio("refresh");

        //$("input:checkbox").each(function()
        //{
        //    $(this).prop("checked", false).checkboxradio("refresh");
        //});

        $("input:text, textarea").val("");

        var rbs = $("input:radio");
        rbs.checkboxradio();
        //$("input[type='radio']").checkboxradio("refresh");
        rbs.prop("checked", false).checkboxradio("refresh");

        //$("input[type='checkbox']").attr("checked",true).checkboxradio("refresh");
        //$("input:checkbox").prop("checked", false);
        //$("input:radio").prop("checked", false);

        $(".multitable").each(function(idx)
        {
            var trs = $(this).find("tbody tr");
            if(trs && trs.length > 0)
            {
                //console.log(trs);
                trs.remove();
            }
        });
    };

    var getMultiTableData = function(id)
    {
        var mt = $(id);
        if(mt && mt.length > 0)
        {
            var key = mt.data("multiname");
            var vals = [];
            var valKeys = [];
            var valStructure = {};

            mt.find("thead th").each(function()
            {
                if($(this).data("fieldname") !== "") { valKeys.push($(this).data("fieldname")); }
            });

            mt.find("tbody tr").each(function()
            {
                valStructure = {};

                var isValidEntry = true;

                $(this).find("td").each(function(idx)
                {
                    var elem = $(this).find(":input");
                    if(elem && elem.length > 0)
                    {
                        switch(elem.attr("type"))
                        {
                            case "text":
                            case "number":
                            case "tel":
                                if(elem.val() !== "")
                                {
                                    valStructure[valKeys[idx]] = elem.val();
                                }
                                else
                                {
                                    isValidEntry = false;
                                }

                                break;

                            case "checkbox":
                                if(elem.prop("checked"))
                                {
                                    valStructure[valKeys[idx]] = elem.val();
                                }
                                else
                                {
                                    valStructure[valKeys[idx]] = null;
                                }
                                break;

                            case undefined:

                                switch(elem.prop("tagName"))
                                {
                                    case "SELECT":
                                        if(elem.val() !== "")
                                        {
                                            valStructure[valKeys[idx]] = elem.val();
                                        }
                                        else
                                        {
                                            isValidEntry = false;
                                        }
                                        break;
                                }
                                break;

                        }
                    }
                });
                //console.log(valStructure);
                if(isValidEntry) { vals.push(valStructure); }
            });

            return vals;
        }
    };

    var findInObjectLiteral = function(obj, key, val)
    {
        var objects = [];
        for (var i in obj)
        {
            if (!obj.hasOwnProperty(i)) continue;

            if (typeof obj[i] == "object")
            {
                objects = objects.concat(findInObjectLiteral(obj[i], key, val));
            }
            else if (i == key && obj[key] == val)
            {
                objects.push(obj);
            }
        }
        return objects;
    };

    var hideLoader = function()
    {
        $("#divLoader").hide();
    };

    var showErrorPage = function()
    {
        $("#btnCopyError").click(function(e)
        {
            e.preventDefault();
        });

        $("#btnReloadApp").click(function(e)
        {
            e.preventDefault();
        });

        $.mobile.pageContainer.pagecontainer("change", "#pgError");
    };

    // Public method exposure
    var pub =
    {
        removeStickyGrowls: removeStickyGrowls,
        makeGrowl: makeGrowl,
        guid: guid,
        isLandscape: isLandscape,
        isOnline: isOnline,
        serializeFormData: serializeFormData,
        pToActivityWindow: printToActivityWindow,
        p: printMessage,
        navigateToPage: navigateToPage,
        clearForm: clearForm,
        toggleItemSpecificUi: toggleItemSpecificUi,
        showPopupMessage: showPopupMessage,
        getMultiTableData: getMultiTableData,
        findInObjectLiteral: findInObjectLiteral,
        hideLoader: hideLoader,
        showErrorPage: showErrorPage
    };

    return pub;


});