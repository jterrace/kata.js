define({

    /**
     * Returns the time in a given space such that the space will be synced with this time
     * Right now does not distinguish between spaces--future may have to lookup the space class
     */
    now: function(space) {
        return scheduled?currentTime:Kata.updateNow();
    },
    
    updateNow: function (newTime) {
        if (newTime===undefined)
            currentTime=(new Date()).getTime();
        else
            currentTime = newTime;
        return currentTime;
    }

});
