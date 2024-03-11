const OsmRateLimiter = {
    lastFetchTime: 0,

    canFetch: function () {
        return Date.now() - this.lastFetchTime >= 1000;
    },

    updateFetchTime: function () {
        this.lastFetchTime = Date.now();
    }
};

function retrieveCitiesFullName(name){
    if (!OsmRateLimiter.canFetch()) {
        // todo
    }
}