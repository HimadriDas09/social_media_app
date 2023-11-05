// create our custom middleware: for flash messages
/* Using a middleware is highly useful here bcz => we're saving every message in
req.flash => which this middleware is storing in req.locals.flash => from there for every message => i.e success,error,warning => we're creating a new Noty Object and displaying the notification */
module.exports.setFlash = function(req, res, next) {
    res.locals.flash = {
        'success' : req.flash('success'),
        'error' : req.flash('error'),
        'warning': req.flash('warning')
    }
    next();
}