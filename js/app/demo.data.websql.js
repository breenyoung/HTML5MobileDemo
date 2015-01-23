/**
 * Created by byoung on 6/27/2014.
 */

define(["app/demo.globals", "app/demo.utility"], function(globals, utility)
{
    "use strict";

    var webDb,
        isStorageReady = false
        ;

    var openLocalStorage = function(successCallback, failureCallback)
    {
        try
        {
            var dbSize = 5 * 1024 * 1024; // 5mb
            webDb = openDatabase("BayDemo", "1.0", "Bay Demo", dbSize);
            runQuery("CREATE TABLE IF NOT EXISTS baydata(" +
                "id TEXT PRIMARY KEY ASC, " +
                "userid TEXT, " +
                "json TEXT, " +
                "submitted_on DATETIME" +
                ")", [], false, successCallback)
        }
        catch(e)
        {
            if(failureCallback) { failureCallback(); }
        }
    };

    var onDbError = function(tx, err)
    {
        utility.p("There has been an websql error: " + err.message);
        return true;
    };

    var runQuery = function(query, data, returnFirst, successCallback, errorCallback)
    {
        if(errorCallback === null) { errorCallback = onDbError; }

        function innerSuccessCallback(tx, rs)
        {
            var i, l, output = [];
            // HACK Convert row object to an array to make our lives easier
            for (i = 0, l = rs.rows.length; i < l; i = i + 1)
            {
                output.push(JSON.parse(rs.rows.item(i).json));
            }

            if (successCallback)
            {
                //successCallback(returnFirst ? output[0] : output);
                successCallback(output);
            }
        }

        webDb.transaction(function(tx)
        {
            tx.executeSql(query, data, innerSuccessCallback, errorCallback);
        });
    };

    var getItemById = function(id, userId, successFunction, errorFunction)
    {
        runQuery("SELECT json FROM baydata WHERE id = ? AND userid = ?", [id, userId], false, successFunction, errorFunction);
    };

    var getItemsByUser = function(userId, successFunction, errorFunction)
    {
        runQuery("SELECT json FROM baydata WHERE userid = ?", [userId], false, successFunction, errorFunction);
    };

    var addItem = function(baydata, successFunction, errorFunction)
    {
        runQuery("INSERT INTO baydata (id,userid,json,submitted_on) VALUES(?, ?, ?, ?)",
            [baydata.Id, baydata.UserId, JSON.stringify(baydata.ItemData), baydata.Created],
            false, successFunction, errorFunction);
    };

    var updateItem = function(baydata, successFunction, errorFunction)
    {
        runQuery("UPDATE baydata SET json = ? WHERE userid = ?", [JSON.stringify(baydata.ItemData), baydata.UserId], false, successFunction, errorFunction);
    };

    var deleteItem = function()
    {

    };

    var init = function(successCallback, failureCallback)
    {
        openLocalStorage(successCallback, failureCallback);
        utility.p("Application data layer init'ed");
    };


    // Public method exposure
    var pub =
    {
        getItemById: getItemById,
        getItemsByUser: getItemsByUser,
        addItem: addItem,
        updateItem: updateItem,
        deleteItem: deleteItem,
        init: init
    };

    return pub;

});
