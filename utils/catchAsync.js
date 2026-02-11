module.exports = function (func) {
    return function (request, response, next) {
        func(request, response, next).catch(next);
    };
}