const express = require('express')
const hubspot = require('@hubspot/api-client')

const schemas = require('../utils/schemas')
const service = require('../services/hubSpotService')
const validate = require('../utils/validation')

const router = express.Router()

function routerWrapper(config) {
    function ipFromReq(req) {
        let ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
        if (ip !== undefined) {
            ip = ip.replace(/^(.+)\:.+$/, '$1')
        }
        return ip
    }

    router.post('/messages', async (req, res, next) => {
        const validation = validate(schemas.newMessageRequest, req.body)
        if (validation !== undefined) { res.status(400).send(validation); return }

        const data = {
            firstname: req.body.name,
            message: req.body.message,
            email: req.body.email
        }

        try {
            let result = await service.postForm(config.messagesFormGuid, data, ipFromReq(req), req.body.hubspotutk)
        } catch (err) {
            res.status(400).send('')
            return
        }

        res.status(200).send('')
    })

    router.post('/restore-quotes', async (req, res, next) => {
        const validation = validate(schemas.newRestoreQuotesRequest, req.body)
        if (validation !== undefined) { res.status(400).send(validation); return }

        const data = {
            email: req.body.email,
            website: req.body.link
        }

        try {
            let result = await service.postForm(config.restoreQuotesFormGuid, data, ipFromReq(req), req.body.hubspotutk)
        } catch (err) {
            res.status(400).send('')
            return
        }

        res.status(200).send('')
    })

    router.post('/callbacks', async (req, res, next) => {
        const validation = validate(schemas.newCallbackRequest, req.body)
        console.log('HERE_1', validation)
        if (validation !== undefined) { res.status(400).send(validation); return }

        const data = {
            firstname: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            time_to_call: req.body.time
        }
        console.log('HERE_2', config.callbackFormGuid, data, ipFromReq(req), req.body.hubspotutk)
        try {
            let result = await service.postForm(config.callbackFormGuid, data, ipFromReq(req), req.body.hubspotutk)
        } catch (err) {
            res.status(400).send('')
            return
        }

        res.status(200).send('')
    })

    return router
}

module.exports = routerWrapper