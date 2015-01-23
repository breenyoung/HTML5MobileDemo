/**
 * Created by byoung on 6/27/2014.
 */

define(["app/demo.globals", "app/demo.utility"], function(globals, utility)
{
    "use strict";

    var db, indexedDB, IDBTransaction, IDBKeyRange;
    var userIdxName = "by_user";

    var dbName = "BayDemo";
    var objStoreName = "itemdata";

    var indexedDBError = function(err)
    {
        utility.p("There has been an indexeddb error: " + err.target.errorCode);
        return true;
    };

    var installModels = function()
    {
        if (db.objectStoreNames.contains(objStoreName))
        {
            db.deleteObjectStore(objStoreName);
        }

        var store = db.createObjectStore(objStoreName, {keyPath: "Id"});
        var userIdx = store.createIndex(userIdxName, "UserId");

        utility.p("Created / Upgraded data structure");
    };

    var init = function(successCallback, failureCallback)
    {
        // Protect ourselves inside old browsers
        try
        {
            indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            IDBTransaction = window.hasOwnProperty("webkitIndexedDB") ? window.webkitIDBTransaction : window.IDBTransaction;
            IDBKeyRange = window.hasOwnProperty("webkitIndexedDB") ? window.webkitIDBKeyRange : window.IDBKeyRange;
        }
        catch (e)
        {
            failureCallback();
        }
        if (!indexedDB)
        {
            failureCallback();
            return;
        }

        var version = 6,
            request = indexedDB.open(dbName, version);

        request.onsuccess = function (event)
        {
            var setVersionRequest;
            db = event.target.result;
            version = String(version);
            if (db.setVersion && version !== db.version)
            {
                setVersionRequest = db.setVersion(version);
                setVersionRequest.onsuccess = function(event)
                {
                    installModels();
                    setVersionRequest.result.oncomplete = function ()
                    {
                        if (successCallback)
                        {
                            successCallback();
                        }
                    };
                };
            }
            else
            {
                successCallback();
            }
        };

        request.onupgradeneeded = function (event)
        {
            db = event.target.result;
            installModels();
        };

        request.onerror = function (event)
        {
            utility.p("You have chosen not to use offline storage");
            failureCallback();
        };

        utility.p("Indexed DB Application data layer init'ed");
    };


    var getItemById = function(id, userId, successFunction, errorFunction)
    {
        var transaction = db.transaction([objStoreName], IDBTransaction.READ_ONLY || 'readonly'),
            store, request;

        transaction.onerror = indexedDBError;
        store = transaction.objectStore(objStoreName);
        request = store.get(id);
        request.onerror = (errorFunction === null) ? indexedDBError : errorFunction;
        request.onsuccess = function (event)
        {
            var result = event.target.result;
            successFunction(result);
        };
    };

    var getItemsByUser = function(userId, successFunction, errorFunction)
    {
        var transaction = db.transaction([objStoreName], IDBTransaction.READ_ONLY || 'readonly'),
            store, request,
            results = [];

        transaction.onerror = indexedDBError;
        store = transaction.objectStore(objStoreName);
        var index = store.index(userIdxName);

        //request = store.openCursor();
        request = index.openCursor(IDBKeyRange.only(userId));
        request.onerror = (errorFunction === null) ? indexedDBError : errorFunction;
        request.onsuccess = function (event)
        {
            var result = event.target.result;

            // When result is null the end is reached
            if (!result)
            {
                successFunction(results);
                return;
            }
            results.push(result.value);

            // Weird to hack jslint
            result['continue']();
        };
    };

    var addItem = function(itemdata, successFunction, errorFunction)
    {
        var transaction = db.transaction([objStoreName], IDBTransaction.READ_WRITE || 'readwrite'),
            store, i,
            request,
            total = itemdata.length;

        /*
        function successCallbackInner()
        {
            total = total - 1;
            if (total === 0)
            {
                successFunction();
            }
        }
        */
        //console.log(itemdata);
        transaction.onerror = indexedDBError;
        store = transaction.objectStore(objStoreName);
        request = store.add(itemdata);
        request.onsuccess = successFunction;
        request.onerror = (errorFunction === null) ? indexedDBError : errorFunction;

        /*
        for (i in itemdata)
        {
            console.log(i);
            if (itemdata.hasOwnProperty(i))
            {
                console.log(itemdata[i])
                //request = store.add(itemdata[i]);
                //request.onsuccess = successCallbackInner;
                //request.onerror = (errorFunction === null) ? indexedDBError : errorFunction;
            }
        }
        */
    };

    var updateItem = function(id, userId, itemdata, successFunction, errorFunction)
    {
        getItemById(id, userId,
        function(result)
        {
            result = itemdata; // Update the entire object

            var transaction = db.transaction([objStoreName], IDBTransaction.READ_WRITE || 'readwrite');
            transaction.onerror = indexedDBError;
            var store = transaction.objectStore(objStoreName);
            var request = store.put(result);
            request.onerror = (errorFunction === null) ? indexedDBError : errorFunction;
            request.onsuccess = successFunction;
        },
        function()
        {
            (errorFunction === null) ? indexedDBError : errorFunction;
        });




    };

    var deleteItem = function(id, successFunction, errorFunction)
    {
        var transaction = db.transaction([objStoreName], IDBTransaction.READ_WRITE || 'readwrite'),
            store, i,
            request
            ;

        transaction.onerror = indexedDBError;
        store = transaction.objectStore(objStoreName);
        request = store.delete(id);
        request.onsuccess = successFunction;
        request.onerror = (errorFunction === null) ? indexedDBError : errorFunction;
    };

    var deleteAll = function(successFunction, errorFunction)
    {
        db.close();

        var request = indexedDB.deleteDatabase(dbName);
        request.onsuccess = function()
        {
            console.log("Deleted database successfully");
            init(successFunction, errorFunction);
        };
        request.onerror = function()
        {
            console.log("Couldn't delete database");
        };
        request.onblocked = function()
        {
            console.log("Couldn't delete database due to the operation being blocked");
        };
    };


    // Public method exposure
    var pub =
    {
        getItemById: getItemById,
        getItemsByUser: getItemsByUser,
        addItem: addItem,
        updateItem: updateItem,
        deleteItem: deleteItem,
        deleteAll: deleteAll,
        init: init
    };

    return pub;

});
