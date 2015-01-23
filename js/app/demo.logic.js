/**
 * Created by byoung on 6/30/2014.
 */

define(["jquery", "app/demo.globals", "app/demo.utility", "app/demo.security", "app/demo.webservices"],
    function($, globals, utility, security, ws)
{
    "use strict";

    var currentItem = {};
    var _isEditingItem = false;
    var _isNewItem = false;

    var isEditingItem = function() { return _isEditingItem; };
    var isNewItem = function() { return _isNewItem; };

    var genericAddSuccess = function()
    {
        _isNewItem = false;
        _isEditingItem = true;
        utility.p("success adding Item");
    };

    var genericUpdateSuccess = function()
    {
        _isEditingItem = true;
        utility.p("success updating Item");
    };

    var genericAddError = function()
    {
        utility.p("error adding Item");
    };

    var genericUpdateError = function()
    {
        utility.p("error updating Item");
    };

    var loginUser = function(userid, password)
    {
        var encryptionSettings = security.deriveKeyAndSalt(userid, password);
        //console.log(encryptionSettings);

        globals.setAesKey(encryptionSettings.key);
        globals.setSalt(encryptionSettings.salt);

        globals.setCurrentUser(userid);
        utility.p("User [" + userid + "] successfully logged in");

        if(globals.isDeveloperMode())
        {
            utility.p("AES Key: " + globals.getAesKey());
            utility.p("Salt: " + globals.getSalt());
        }

        utility.makeGrowl(globals.getLocalizedResources()["messages_loginSuccess"], { time: 2000, title: globals.getLocalizedResources()["global_info"] });

    };


    var logoffUser = function()
    {
        utility.p("Logging off user [" + globals.getCurrentUser() + "]");

        // Do some other stuff here most likely
        globals.setAesKey("");
        globals.setSalt("");
        globals.setCurrentUser("");
        currentItem = {};
    };

    var getItem = function(id, successFunction, errorFunction)
    {
        globals.getDataLayer().getItemById(id, globals.getCurrentUser(), successFunction, errorFunction);
    };

    var getExistingItems = function(userid, successFunction, errorFunction)
    {
        globals.getDataLayer().getItemsByUser(userid, successFunction, errorFunction);
    };

    var initItem = function()
    {
        _isEditingItem = true;
        _isNewItem = true;

        currentItem = {};
        var id = utility.guid();
        currentItem["Id"] = id;
        currentItem["Created"] = new Date();
        currentItem["UserId"] = globals.getCurrentUser();
        currentItem["Finalized"] = false;

        utility.p("Created new item - ID:[" + id + "]");
    };

    var setCurrentItem = function(item)
    {

        //console.log(item);

        _isEditingItem = true;
        _isNewItem = false;

        currentItem = {};
        currentItem["Id"] = item.Id;
        currentItem["Created"] = item.Created;
        currentItem["UserId"] = item.UserId;
        currentItem["Finalized"] = item.Finalized;

        var decryptedItemData = security.decryptString(globals.getAesKey(), item.ItemData, true);
        currentItem["ItemData"] = decryptedItemData;

        utility.p("Setting current item to ID: [" + currentItem["Id"] + "]");

        return currentItem;

    };

    var finalizeItem = function()
    {
        currentItem["Finalized"] = true;
    };

    var refreshItem = function()
    {
        var itemData = {};
        itemData["Id"] = currentItem["Id"];
        itemData["Created"] = currentItem["Created"];
        itemData["UserId"] = currentItem["UserId"];
        itemData["Finalized"] = currentItem["Finalized"];

        var serializedFormData = utility.serializeFormData(globals.getFormId());
        console.log(serializedFormData);

        $.each(serializedFormData, function(k, v)
        {
            //console.log("k: " + k + ", v: " + v);
            itemData[k] = (v === "") ? null : v;
        });

        // Handle 'Multitables'
        $(".multitable").each(function()
        {
            var key = $(this).data("multiname");
            var vals = utility.getMultiTableData("#" + $(this).attr("id"));
            if(vals && vals.length > 0)
            {
                //console.log(vals);
                itemData[key] = vals;
            }
        });

        // Handle signature surfaces
        $("canvas.signature").each(function(idx)
        {
            var elemId = $(this).attr("id");
            //console.log(elemId);

            if($(this).data("jqScribble"))
            {
                if(!$(this).data("jqScribble").blank)
                {
                    $(this).data("jqScribble").save(function(imageData)
                    {
                        //console.log(imageData);
                        itemData[elemId] = imageData;
                    });
                }
                else
                {
                    // If the signature is blank, clear it from the data structure?
                    delete itemData[elemId];
                }
            }
        });

        // Handle manny surfaces
        $("canvas.manny").each(function(idx)
        {
            var elemId = $(this).attr("id");

            if($(this).data("jqScribble"))
            {
                if(!$(this).data("jqScribble").blank)
                {
                    $(this).data("jqScribble").save(function(imageData)
                    {
                        //console.log(imageData);
                        itemData[elemId] = imageData;
                    });
                }
                else
                {
                    // If the signature is blank, clear it from the data structure?
                    delete itemData[elemId];
                }
            }
        });

        $(".tablegrid").each(function(idx)
        {
            var key = $(this).attr("id");
            var data = $("#" + key).jqxGrid("getrows");

            if(data && data.length > 0)
            {
                itemData[key] = data;
            }
        });

        currentItem["ItemData"] = itemData;

        console.log(itemData);

        utility.p("Refreshed data for Item - ID:[" + currentItem["Id"] + "]");
    };

    var deleteItem = function(id, successFunction, errorFunction)
    {
        globals.getDataLayer().deleteItem(id, successFunction, errorFunction);
    };

    var updateItem = function(successFunction, errorFunction)
    {
        if(currentItem && currentItem["ItemData"])
        {
            var encryptedItem = security.encryptString(globals.getAesKey(), currentItem["ItemData"], true);
            currentItem["ItemData"] = JSON.parse(encryptedItem);
            globals.getDataLayer().updateItem(currentItem["Id"], globals.getCurrentUser(), currentItem, successFunction, errorFunction);
        }
    };

    var addItem = function(successFunction, errorFunction)
    {
        if(currentItem && currentItem["ItemData"])
        {
            var encryptedItem = security.encryptString(globals.getAesKey(), currentItem["ItemData"], true);
            currentItem["ItemData"] = JSON.parse(encryptedItem);
            globals.getDataLayer().addItem(currentItem, successFunction, errorFunction);
        }
    };

    var init = function()
    {
        utility.p("Application logic init'ed");
    };

    // Public method exposure
    var pub =
    {
        genericAddSuccess: genericAddSuccess,
        genericUpdateSuccess: genericUpdateSuccess,
        genericAddError: genericAddError,
        genericUpdateError: genericUpdateError,

        loginUser: loginUser,
        logoffUser: logoffUser,
        getItem: getItem,
        getExistingItems: getExistingItems,
        initItem: initItem,
        refreshItem: refreshItem,
        addItem: addItem,
        updateItem: updateItem,
        deleteItem: deleteItem,
        setCurrentItem: setCurrentItem,
        isEditingItem: isEditingItem,
        isNewItem: isNewItem,
        finalizeItem: finalizeItem,
        init: init
    };

    return pub;
});