define(["jquery", "powertimers", "moment", "app/demo.globals", "app/demo.utility", "app/demo.logic"], function($, powerTimer, moment, globals, utility, logic)
{
    "use strict";

    var _idleTime = 0;

    var _timerSaveItemId = "saveitem";
    var timerSaveItemId = function() { return _timerSaveItemId; }

    var _timerIdleLogout = "idlelogout";
    var timeIdleLogout = function() { return _timerIdleLogout; }

    var clearTimer = function(id)
    {
        utility.p("Clearing application timer: [" + id + "]");
        $(document).powerTimer("stop", id);
    };

    var clearAllTimers = function()
    {
        utility.p("Clearing all application timers");
        $(document).powerTimer("stop", _timerSaveItemId);
    };

    var continueTimer = function(id)
    {
        utility.p("Continuing application timer: [" + id + "]");
        $(document).powerTimer("continue", id);
    };

    var continueAllTimers = function()
    {
        utility.p("Continuing all application timers");
        $(document).powerTimer("continue", _timerSaveItemId);
    };

    var pauseTimer = function(id)
    {
        utility.p("Pausing application timer: [" + id + "]");
        $(document).powerTimer("pause", id);
    };

    var pauseAllTimers = function()
    {
        utility.p("Pausing all application timers");
        $(document).powerTimer("pause", _timerSaveItemId);
    };

    var init = function()
    {
        _idleTime = 0;

        // Initialize all application timers

        // Item periodic saving
        $(document).powerTimer({
           //sleep: 240000,
           sleep: 30000,
           name: _timerSaveItemId,
           func: function()
           {
               logic.refreshItem();

               if(logic.isNewItem())
               {
                   logic.addItem(logic.genericAddSuccess, logic.genericAddError);
               }
               else
               {
                   logic.updateItem(logic.genericUpdateSuccess, logic.genericUpdateError);
               }

               utility.p("[" + moment().format("MM.DD.YYYY HH:mm:ss") + "] Timer: [" + _timerSaveItemId + "] executed");
           }
        });
        pauseTimer(_timerSaveItemId); // Don't start this one right away, determined by actions


        // Idle timeout
        $(document).powerTimer({
            interval: 60000,
            name: _timerIdleLogout,
            func: function ()
            {
                _idleTime += 1;

                //console.log("IDLE TIME IS NOW:" + _idleTime + " mins");

                if(_idleTime > globals.getIdleTimeMax())
                {
                    utility.p("User idle for [" + globals.getIdleTimeMax() + "] mins, logging out");

                    // Save Item is something is currently being worked on
                    if(logic.isEditingItem())
                    {
                        logic.refreshItem();

                        if(logic.isNewItem())
                        {
                            logic.addItem(logic.genericAddSuccess, logic.genericAddError);
                        }
                        else
                        {
                            logic.updateItem(logic.genericUpdateSuccess, logic.genericUpdateError);
                        }
                    }

                    utility.clearForm();
                    utility.toggleItemSpecificUi("hide");


                    pauseTimer(_timerIdleLogout);
                    pauseTimer(_timerSaveItemId);

                    _idleTime = 0;

                    logic.logoffUser();

                    utility.makeGrowl(globals.getLocalizedResources()["messages_idleLogout"], { sticky: true});
                    utility.navigateToPage("#pgLogin");
                }
            }
        });
        pauseTimer(_timerIdleLogout); // Don't start this one right away, determined by actions

        //Zero the idle timer on mouse movement.
        $(window).mousemove(function(e) { _idleTime = 0; });
        $(window).scrollstart(function(e) {  _idleTime = 0; });
        $(window).tap(function(e) { _idleTime; });
        $(window).keypress(function(e) { _idleTime = 0; });

        utility.p("Timers initialized");
    };

    // Public method exposure
    var pub =
    {
        timerSaveItemId: timerSaveItemId,
        timeIdleLogout: timeIdleLogout,
        clearTimer: clearTimer,
        clearAllTimers: clearAllTimers,
        continueTimer: continueTimer,
        continueAllTimers: continueAllTimers,
        pauseTimer: pauseTimer,
        pauseAllTimers: pauseAllTimers,

        init: init
    };

    return pub;

});
