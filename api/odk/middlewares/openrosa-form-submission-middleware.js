/*!
 * Connect - multipart
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2013 Andrew Kelley
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var multiparty = require('multiparty')
var onFinished = require('on-finished')
var typeis = require('type-is')
var fs = require('fs')
var debug = require('debug')('openrosa:submission')
var openrosaRequest = require('./openrosa-request-middleware')
var openrosaRequestMiddleware = openrosaRequest()

/**
 * Multipart:
 *
 * Parse multipart/form-data request bodies,
 * providing the parsed object as `req.body`
 * and `req.files`.
 *
 * Configuration:
 *
 *  The options passed are merged with [multiparty](https://github.com/andrewrk/node-multiparty)'s
 *  `Form` object, allowing you to configure the upload directory,
 *  size limits, etc. For example if you wish to change the upload dir do the following.
 *
 *     app.use(connect.multipart({ uploadDir: path }))
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function (options) {
    options = options || {}
    options.maxContentLength = options.maxContentLength || 10485760

    function multipart (req, res, next) {
        if (req._body) return next()
        req.files = []
        req.body = undefined

        if (req.method === 'HEAD') {
            // Response to HEAD requests with status 204
            return res.sendStatus(204)
        } else if (req.method !== 'POST') {
            // Ignore all other request methods other than post
            return next()
        }

        // check Content-Type
        if (!typeis(req, 'multipart/form-data')) return next()

        debug('processing form submission')

        // flag as parsed
        req._body = true

        // parse
        var form = new multiparty.Form(options)
        var done = false
        var processingXml = false
        var wasError = false

        form.on('file', function (name, val) {
            val.name = val.originalFilename
            val.type = val.headers['content-type'] || null

            if (name === 'xml_submission_file') {
                debug('received xml submission file (%s bytes)', val.size)
                processingXml = true
                fs.readFile(val.path, function (err, data) {
                    if (err) onError(err)
                    req.body = data.toString()
                    fs.unlink(val.path, function (err) {
                        if (err) console.error('Error deleting file %s', val.path)
                    })
                    debug('processed xml submission')
                    processingXml = false
                    if (done && !wasError) next()
                })

            } else {
                debug('received attachment %s (%s bytes)', val.name, val.size)
                req.files.push(val)
            }
        })

        form.on('error', function (err) {
            if (done) return
            onError(err)
        })

        form.on('close', function () {
            if (done) return

            done = true

            // only continue if we have already processed the xml submission file
            // and attached it to the req.body
            if (req.body) {
                next()
            } else if (!processingXml) {
                onError(new Error('No xml submission file included in request'))
            }
        })

        function onError (err) {
            debug('form processing error:', err.message)
            done = wasError = true

            err.status = 400

            if (!req.readable) return next(err)

            req.resume()
            onFinished(req, function () {
                next(err)
            })
        }

        // IMPORTANT! - log parsed file upon upload completion
        form.parse(req, function(err, fields, files){
            Object.keys(fields).forEach(function(name) {
                console.log('got field named ' + name);
            });

            Object.keys(files).forEach(function(name) {
                console.log('got file named ' + name);
            });

            console.log('Upload completed!');
        })
    }

    return function (req, res, next) {
        // Set correct OpenRosa headers
        // see https://bitbucket.org/javarosa/javarosa/wiki/OpenRosaRequest
        // and https://bitbucket.org/javarosa/javarosa/wiki/FormSubmissionAPI
        openrosaRequestMiddleware(req, res, function (err) {
            if (err) next(err)
            res.setHeader('X-OpenRosa-Accept-Content-Length', options.maxContentLength)
            multipart(req, res, next)
        })
    }
}
