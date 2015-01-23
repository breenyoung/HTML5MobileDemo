define(["jquery", "jqscribble", "mustache", "moment", "app/demo.globals", "app/demo.utility", "app/demo.logic", "app/demo.security", "app/demo.timers", "app/demo.formparser", "app/demo.webservices", "app/demo.localization"],
    function($, jqScribble, Mustache, moment, globals, utility, logic, security, timers, formparser, ws, localization)
{
    "use strict";

    var formValidator = undefined;

    var init = function()
    {
        initValidation();

        //setTimeout(function(){utility.navigateToPage("#pgLogin", { transition: "fade"});}, 1000);



        // Developer only items
        if(!globals.isDeveloperMode())
        {
            $("#hlActivityLog").hide();
        }

        // Hide Navigation elements specific to Items on load
        utility.toggleItemSpecificUi("hide");

        $("#hlDevUpdate").click(function(e)
        {
            e.preventDefault();
            reparseForm();
        });

        $("#hlDevClearLocalStorage").click(function(e)
        {
            timers.pauseAllTimers();

            e.preventDefault();
            if(confirm("Delete all records?"))
            {
                globals.getDataLayer().deleteAll(function()
                {
                    utility.toggleItemSpecificUi("hide");
                    alert("Local Storage cleared");
                },
                function()
                {
                    alert("Error clearing Local Storage");
                });
            }
        });


        // Clear log button
        $("#btnClearLog").click(function(e) { $("#tbLog").val(""); });

        // New Item button
        $(document).on("click", "#btnNewItem", function(e)
        {
            if(logic.isEditingItem()) { utility.clearForm(); timers.pauseTimer(timers.timerSaveItemId()); }

            logic.initItem();
            timers.continueTimer(timers.timerSaveItemId());

            utility.toggleItemSpecificUi("show");
            utility.navigateToPage(globals.getFormPages()[0]); // First page
        });

        // Existing Items button
        $(document).on("click", "#btnExistingItems", function(e)
        {
            logic.getExistingItems(globals.getCurrentUser(),
                function(results)
                {
                    var len = results.length, i;

                    utility.p("[" + len + "] item(s) found for user [" + globals.getCurrentUser() + "]");

                    var rowsToAppend = "";
                    var tbody = $("#tblExisting").find("tbody");
                    tbody.html("");
                    for (i = 0; i < len; i++)
                    {
                        var row = results[i];

                        var item = row; //JSON.parse(row);

                        var decryptedItemData = security.decryptString(globals.getAesKey(), item.ItemData, true);
                        var formattedDate = moment(item.Created);

                        var nameDisplay = Mustache.render(globals.getListDisplayFormat(), decryptedItemData);

                        rowsToAppend += "<tr>"
                            + "<td><a href='#' data-itemid='" + item.Id + "'>" + "Open" + "</a></td>"
                            + "<td>" + nameDisplay + "</td>"
                            + "<td>" + formattedDate.format(globals.getDateFormat()) + "</td>"
                            + "<td>"
                            + "<div class='ui-btn ui-input-btn ui-corner-all ui-shadow'>" + globals.getLocalizedResources()["global_delete"]
                            + "<input type='button' class='ignore' data-itemid='" + item.Id + "' data-enhanced='true' value='" + globals.getLocalizedResources()["global_delete"] + "' />"
                            + "</div>"
                            + "</td></tr>";

                    }
                    tbody.append(rowsToAppend);

                    tbody.find("td input:button").click(function(e)
                    {
                        var b = $(this);

                        if(confirm(globals.getLocalizedResources()["messages_delete_confirm"]))
                        {
                            var id = $(this).data("itemid");
                            logic.deleteItem(id, function()
                            {
                                b.parent().parent().parent().remove();
                                utility.makeGrowl(globals.getLocalizedResources()["messages_delete_success"], { time: 2000 });
                                utility.p("Successfully deleted Item [" + id + "]");
                            },
                            function()
                            {
                                utility.makeGrowl(globals.getLocalizedResources()["messages_delete_error"], { time: 2000 });
                                utility.p("Error deleting Item [" + id + "]");
                            });
                        }
                    });

                    utility.navigateToPage("#pgExistingItems")
                },
                function(tx, err)
                {
                    utility.navigateToPage("#pgExistingItems");
                }
            );
        });

        // Register online / offline event firing
        window.addEventListener("offline", function(e)
        {
            timers.pauseAllTimers();
            utility.makeGrowl(globals.getLocalizedResources()["messages_offline"], { title: globals.getLocalizedResources()["global_offline"] });
            utility.p("Application is offline!");
        }, false);

        window.addEventListener("online", function(e)
        {
            timers.continueAllTimers();
            utility.makeGrowl(globals.getLocalizedResources()["messages_online"], { title: globals.getLocalizedResources()["global_online"] });
            utility.p("Application is online!");
        }, false);

        // Login button
        $(document).on("click", "#btnLogin", function(e)
        {
            var u = $("#tbUsername");
            var p = $("#tbPassword");

            if(u.val() !== "" && p.val() !== "")
            {
                processLogin(u, p);
            }
            else
            {
                utility.showPopupMessage(globals.getLocalizedResources()["messages_requiredLoginFields"], globals.getLocalizedResources()["global_error"]);
            }
        });

        // Logoff button
        $(document).on("click", "#hlLogoff", function(e)
        {
            // TODO: Save Item if editing one?

            e.preventDefault();
            logic.logoffUser();
            utility.clearForm();
            timers.pauseTimer(timers.timerSaveItemId());
            timers.pauseTimer(timers.timeIdleLogout());

            utility.toggleItemSpecificUi("hide");
            utility.navigateToPage("#pgLogin");

            utility.makeGrowl(globals.getLocalizedResources()["messages_logoutSuccess"], { time: 2000, title: globals.getLocalizedResources()["global_info"] });

        });

        $(document).on("click", "#hlAbout", function(e)
        {
            e.preventDefault();

            $("#aboutVersion").text(globals.getVersion());
            $("#aboutLanguage").text(globals.getCulture());
            $("#aboutLanguageFile").text(globals.getLanguageFile());
            $("#aboutFormDefinitionFile").text(globals.getFormDefinitionFile());
            $("#aboutReportFile").text(globals.getReportFile());
            //data-rel="popup" data-position-to="window"

            $("#puAbout").popup("open");
        });

        // Submit to Server button
        $(globals.getFormId()).on("click", "#btnSubmitToServer", function()
        {
            var isValid = formValidator.form();
            console.log(isValid);
            console.log("[" + formValidator.numberOfInvalids() + "] field(s) are invalid");
            console.log(formValidator.showErrors());

            /*
            if(isValid)
            {
                logic.finalizeItem();
                logic.refreshItem();
                logic.addItem(function(tx)
                    {
                        utility.navigateToPage("#pgAppHome");
                        utility.makeGrowl(globals.getLocalizedResources()["messages_save_success"], { title: globals.getLocalizedResources()["global_success"]});
                        timers.pauseAllTimers();
                    },
                    function(tx, err)
                    {
                        utility.p("There was an storage error: " + err.message);
                        utility.makeGrowl(globals.getLocalizedResources()["messages_save_error"], { title: globals.getLocalizedResources()["global_error"]});
                    });
            }
            else
            {
                // TODO: Show error summary?
                console.log("There were validation errors!");
            }
            */
        });

        // Existing Item links
        $("#tblExisting").on("click", "a", function(e)
        {
            e.preventDefault();

            if(logic.isEditingItem()) { utility.clearForm(); }

            logic.getItem($(this).data("itemid"), function(results)
            {
                var p = logic.setCurrentItem(results);
                populateForm(p.ItemData);
                timers.continueAllTimers();
                utility.toggleItemSpecificUi("show");
                utility.navigateToPage(globals.getFormPages()[0]); // First page
            },
            function(tx, err)
            {
                utility.p("There was an storage error: " + err.message);
                utility.makeGrowl(globals.getLocalizedResources()["messages_save_error"], { title: globals.getLocalizedResources()["global_error"]});
            });
        });


        // Multi math fields
        //setupMathFieldSet({workfields: ["#tbSo1Gcs1", "#tbSo1Gcs2", "#tbSo1Gcs3"], totalfield: "#tbSo1GcsTotal"});
        //setupMathFieldSet({workfields: ["#tbSo2Gcs1", "#tbSo2Gcs2", "#tbSo2Gcs3"], totalfield: "#tbSo2GcsTotal"});
        //setupMathFieldSet({workfields: ["#tbSo1Rts1", "#tbSo1Rts2", "#tbSo1Rts3"], totalfield: "#tbSo1RtsTotal"});
        //setupMathFieldSet({workfields: ["#tbSo2Rts1", "#tbSo2Rts2", "#tbSo2Rts3"], totalfield: "#tbSo2RtsTotal"});


        initDynamicControls();

        utility.p("Application UI events init'ed");
    };

    var initValidation = function()
    {
        formValidator = $(globals.getFormId()).validate(globals.getFormValidator());
        $.each(globals.getValidationRules(), function(key, val)
        {

            var elemType = key.substr(0,2);
            var selector = "#" + key;

            if(elemType === "rb")
            {
                selector = "input[name='" + key + "']";
            }

            var obj = $(selector);
            if(obj.length > 0)
            {
                obj.rules("add", val);
            }
            else
            {
                utility.p("Validation rule failed for elem:" + key);
            }
        });
    };

    var initDynamicControls = function()
    {
        // Make all radio buttons unselectable
        $("input:radio").on("click", function()
            //$("input[type='radio']").click(function()
        {
            var previousValue = $(this).attr('previousValue');
            var name = $(this).attr('name');

            if (previousValue == "checked")
            {
                $(this).removeAttr("checked");
                $(this).attr("previousValue", false);
            }
            else
            {
                $("input[name="+name+"]:radio").attr("previousValue", false);
                $(this).attr("previousValue", "checked");
            }
        });

        $(".clearSignature").click(function(e)
        {
            e.preventDefault();
            if($(e.target).data("canvasid"))
            {
                //console.log($(e.target).data("canvasid"));
                $("#" + $(e.target).data("canvasid")).data("jqScribble").clear();
            }
        });

        $(".clearManny").click(function(e)
        {
            e.preventDefault();
            if($(e.target).data("canvasid"))
            {
                var c = $("#" + $(e.target).data("canvasid"));
                c.data("jqScribble").clear().update({"backgroundImage": c.data("bgimage")});
            }
        });

        $(".clearMannyNotes").click(function(e)
        {
            e.preventDefault();
            if($(e.target).data("canvasnotesid"))
            {
                $("#" + $(e.target).data("canvasnotesid")).val("");
            }
        });

        // Signature surfaces
        $("canvas.signature").jqScribble({ backgroundColor: "#CCCCCC", saveFunction: saveSignature });

        // Manny surfaces
        $("canvas.manny").each(function()
        {
            $(this).jqScribble({ backgroundColor: "#CCCCCC", backgroundImage: $(this).data("bgimage"), brushColor: $(this).data("brushcolor"), saveFunction: saveSignature });
        });
    };

    var processLogin = function(u, p)
    {
        // Temporary demo stuff
        if( (u.val().toLowerCase() === "username" && p.val() === "password") )
        {
            var user = u.val().toLowerCase();

            logic.loginUser(user, p.val());
            utility.removeStickyGrowls();
            timers.continueTimer(timers.timeIdleLogout());
            utility.navigateToPage("#pgAppHome");
        }
        else
        {
            utility.showPopupMessage(globals.getLocalizedResources()["messages_loginError"], globals.getLocalizedResources()["global_error"]);
        }

        /*
         ws.authenticateUser(u.val(), p.val(),
         function(jqxhr, errorCode)
         {
         console.log(jqxhr);
         utility.showPopupMessage(globals.getLocalizedResources()["messages_loginError"], globals.getLocalizedResources()["global_error"]);
         },
         function(data, status)
         {
         console.log(data);
         logic.loginUser(u.val(), p.val());
         utility.removeStickyGrowls();
         timers.continueTimer(timers.timeIdleLogout());
         utility.navigateToPage("#pgAppHome");
         });
         */
    };


    var saveSignature = function(imageData)
    {
        /*
        if(!signatureCanvas.data("jqScribble").blank)
        {
            $("#imgSignature").attr("src", imageData);
            $("#imgSignature").show();
            utility.p("Signature saved");
        }
        */
    };

    var populateForm = function(data)
    {
        console.log(data);
        $.each(data, function(key, val)
        {
            if(val !== null)
            {
                //console.log("key:" + key + ", val:" + val);
                var prefix = key.substr(0, 2);
                //console.log(prefix);

                if(prefix === "tb")
                {
                    $("#" + key).val(val);
                }
                else if(prefix === "rb")
                {
                    //$("#" + key).prop("checked", true);
                    //$(":radio[name='" + key + "'][value='" + val + "']").prop("checked", true);
                    var r = $(":radio[name='" + key + "'][value='" + val + "']");
                    r.checkboxradio();
                    r.prop("checked", true).checkboxradio("refresh");
                }
                else if(prefix === "cb")
                {
                    if($.isArray(val))
                    {
                        $.each(val, function(index, value)
                        {
                            var cb = $(":checkbox[name='" + key + "'][value='" + value + "']");
                            cb.checkboxradio();
                            cb.prop("checked", true).checkboxradio("refresh");
                        });
                    }
                    else
                    {
                        var cb = $(":checkbox[name='" + key + "'][value='" + val + "']");
                        cb.checkboxradio();
                        cb.prop("checked", true).checkboxradio("refresh");
                    }
                }
                else if(prefix === "fs")
                {
                    var cb = $(":checkbox[name='" + key + "'][value='" + val + "']");
                    cb.flipswitch();
                    cb.prop("checked", true).flipswitch("refresh");
                }
                else if(prefix === "dt")
                {
                    $("#" + key).val(val);
                }
                else if(prefix === "mt")
                {
                    // Handle multitable
                    var arr = val;
                    if(arr && arr.length > 0)
                    {
                        var elems = [];
                        var mtData = utility.findInObjectLiteral(globals.getFormElements(), "id", key);
                        for(var j = 0; j < mtData[0].fields.length; j++)
                        {
                            elems.push({ id: mtData[0].fields[j].id , element: mtData[0].fields[j].element});
                        }

                        var tbl = $("#" + key);
                        for(var i = 0; i < arr.length; i++)
                        {
                            formparser.setupMultiTableRow(tbl, elems, arr[i]);
                        }
                    }
                }
                else if(prefix === "sm")
                {
                    if($.isArray(val)) // Multi select
                    {
                        for(var i = 0; i < val.length; i++)
                        {
                            $("#" + key + " option[value='" + val[i] + "']").prop("selected", true);
                        }
                    }
                    else
                    {
                        $("#" + key + " option[value='" + val + "']").prop("selected", true);
                    }

                    $("#" + key).selectmenu("refresh");

                }
                else if(prefix === "sg")
                {
                    var selector = $("#" + key);
                    if(selector.length)
                    {
                        selector.data("jqScribble").update({ backgroundImage: val });
                    }
                }
                else if(prefix === "mn")
                {
                    var selector = $("#" + key);
                    var textareaKey = "notes-" + key;

                    if(selector.length)
                    {
                        selector.data("jqScribble").update({ backgroundImage: val });
                        $("#" + textareaKey).val(data[textareaKey]);
                    }
                }
                else if(prefix === "tg")
                {
                    //console.log($("#" + key).data("jqx-datafields"));
                    var src =
                    {
                        localdata: val,
                        datatype: "json",
                        datafields: $("#" + key).data("jqx-datafields")
                    };
                    var dataAdapter = new $.jqx.dataAdapter(src);

                    $("#" + key).jqxGrid({ source: dataAdapter });
                }
            }
        });
    };

    var buildReview = function()
    {
        var formPages = globals.getFormPages();
        var formElems = globals.getFormElements();
        var formElemLen = formElems.length;

        $.get(globals.getReportFile(), function(data)
        {
            var templateReplacements = {};

            templateReplacements.sectionLinks = {};
            templateReplacements.labels = globals.getLocalizedResources();
            templateReplacements.values = {};
            templateReplacements.ids = {};

            // Store sections
            for(var i = 0; i < formPages.length; i++)
            {
                templateReplacements.sectionLinks[formPages[i].substr(1)] = formPages[i];
            }

            // Store form values
            for(var x = 0; x < formElemLen; x++)
            {
                var elemType = formElems[x].type;
                var elemVal = "";
                var isValidForReview = true;

                if(elemType === "text" || elemType === "textarea" || elemType === "time"
                    || elemType === "number" || elemType === "datetime" || elemType === "date" || elemType === "phone")
                {
                    elemVal = $("#" + formElems[x].id).val();
                }
                else if(elemType === "checkboxsingle" || elemType == "flipswitch")
                {
                    elemVal = $("#" + formElems[x].id).prop("checked") ? globals.getLocalizedResources()["global_yes"] : globals.getLocalizedResources()["global_no"];
                }
                else if(elemType === "checkboxgroup")
                {
                    $("input:checkbox[name=" + formElems[x].id + "]:checked").each(function()
                    {
                        elemVal += $(this).val() + ", ";
                    });

                    elemVal = elemVal.slice(0, -2);
                }
                else if(elemType === "radiosingle")
                {
                    elemVal = $("#" + formElems[x].id).val();
                }
                else if(elemType === "radiogroup")
                {
                    elemVal = $("#" + formElems[x].section + " input[name='" + formElems[x].id + "']:checked").val();
                }
                else if(elemType === "signature")
                {
                    if(!$("#" + formElems[x].id).data("jqScribble").blank)
                    {
                        $("#" + formElems[x].id).data('jqScribble').save(function(imageData)
                        {
                            elemVal = "<img src='" + imageData + "'/>";
                        });
                    }
                }
                else if(elemType === "manny")
                {
                    if(!$("#" + formElems[x].id).data("jqScribble").blank)
                    {
                        $("#" + formElems[x].id).data('jqScribble').save(function(imageData)
                        {
                            elemVal = "<img src='" + imageData + "'/>";
                        });

                    }
                    elemVal += "<br/>"+ $("#notes-" + formElems[x].id).val();
                }
                else if(elemType === "multitable")
                {
                    var el = $("#" + formElems[x].id);
                    var t = $("<table width='100%'></table>");

                    t.append(el.find("thead th:lt(-1)").clone());

                    $(el.find("tbody tr")).each(function()
                    {
                        var isValidEntry = true;
                        var tr = $(this);
                        var h = "<tr>";

                        tr.find("td:lt(-1)").each(function()
                        {
                            var i = $(this).find(":input");

                            if(i && i.length > 0)
                            {
                                switch(i.attr("type"))
                                {
                                    case "text":
                                    case "number":
                                    case "tel":
                                        if(i.val() !== "")
                                        {
                                            h += "<td>" + i.val() + "</td>";
                                        }
                                        else
                                        {
                                            isValidEntry = false;
                                        }

                                        break;

                                    case "checkbox":
                                        if(i.prop("checked"))
                                        {
                                            h += "<td>" + globals.getLocalizedResources()["global_yes"] +  "</td>";
                                        }
                                        else
                                        {
                                            h += "<td>" + globals.getLocalizedResources()["global_no"] +  "</td>";
                                        }
                                        break;

                                    case undefined:

                                        switch(i.prop("tagName"))
                                        {
                                            case "SELECT":
                                            {
                                                h += "<td>" + i.val() + "</td>";
                                                break;
                                            }
                                        }
                                        break;
                                }
                            }
                        });

                        h += "</tr>";
                        if(isValidEntry) { t.append(h); }
                    });

                    elemVal = t[0].outerHTML;
                }
                else if(elemType === "select")
                {
                    elemVal = $("#" + formElems[x].id).val();
                }

                if(isValidForReview)
                {
                    templateReplacements.values[formElems[x].id] = elemVal;
                    templateReplacements.ids[formElems[x].id] = formElems[x].id;
                }
            }

            var formattedOutput = Mustache.render(data, templateReplacements);
            $("#divReviewContainer").html(formattedOutput);
        });
    };

    var setupMathFieldSet = function(opts)
    {
        if(opts && opts.workfields && opts.totalfield)
        {
            for(var i = 0; i < opts.workfields.length; i++)
            {
                $(opts.workfields[i]).bind("blur", function(e)
                {
                    var total = 0;
                    $.each(opts.workfields, function(idx, item)
                    {
                        var n = parseInt($(item).val()) || 0;
                        total += n;
                    });

                    $(opts.totalfield).val(total);
                });
            }
        }
    };

    var reparseForm = function()
    {
        var newLangFile = $("#tbDevLanguageFile").val();
        var newFormDef = $("#tbDevFormFile").val();
        var newReportFile = $("#tbDevReportFile").val();

        globals.setReportFile(newReportFile);

        if(newLangFile !== globals.getLanguageFile() || newFormDef !== globals.getFormDefinitionFile())
        {
            $.ajax({
                url: newLangFile,
                dataType: "json",
                type: "GET",
                error: function(jqxhr, errorCode)
                {
                    utility.p("Error retrieving language file: " + errorCode);
                },
                success: function(data, status)
                {
                    globals.setLocalizedResources(data);
                    globals.setLanguageFile(newLangFile);

                    // Localize the static portions of the form
                    localization.localizeApp();

                    formparser.init();
                    $.ajax({
                        url: newFormDef,
                        dataType: "json",
                        type: "GET",
                        error: function(jqxhr, errorCode)
                        {
                            utility.p("Error retrieving form definition: " + errorCode);
                        },
                        success: function(data, status)
                        {
                            for(var i = 0; i < globals.getFormPages().length; i++)
                            {
                                $("#pnlNavGlobal").find("a").each(function()
                                {
                                    if(globals.getFormPages()[i] === $(this).attr("href"))
                                    {
                                        $(this.remove());
                                    }
                                    //console.log($(this).attr("href"));
                                });
                            }
                            $("#pnlNavGlobal").trigger("updatelayout");

                            formparser.parseFormDefinition(data);

                            // Prefetch pages for UI responsiveness
                            var prefetchPages = globals.getFormPages();
                            for(var i = 0; i < prefetchPages.length; i++)
                            {
                                $(":mobile-pagecontainer").pagecontainer("load", prefetchPages[i], { showLoadMsg: false } );
                            }

                            globals.setFormDefinitionFile(newFormDef);

                            logic.logoffUser();
                            utility.clearForm();
                            timers.pauseTimer(timers.timerSaveItemId());
                            timers.pauseTimer(timers.timeIdleLogout());
                            utility.navigateToPage("#pgLogin");
                        }
                    });
                }
            });
        }

    };


    // Public method exposure
    var pub =
    {
        init: init,
        buildReview: buildReview
    };

    return pub;
});