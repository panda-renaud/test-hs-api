const express = require('express')
const joi = require('joi')
const crypto = require('crypto')
const moment = require('moment-timezone')

const schemas = require('../utils/schemas')
const quoteUtils = require('../utils/quotes')
const validate = require('../utils/validation')

const router = express.Router()

function routerWrapper(config) {
    router.post('/', async (req, res, next) => {
        const validation = validate(schemas.newQuote, req.body)
        if (validation !== undefined) { res.status(400).send(validation); return }

        const data = req.body

        const db = config.dbClient
        const database = config.dbParams.database
        const container = config.dbParams.container

        let pet = {}
        try {
            const result = await db.database(database).container(container).item(data.petId, data.petId).read()
            if (result.statusCode == 200) {
                pet = result.resource
            } else {
                res.status(result.statusCode).send("")
                return
            }
        } catch (err) {
            res.status(500).send("")
            return
        }

        let newQuote = {}
        try {
            newQuote = await quoteUtils.create(pet, data, config.apiConfig)
        } catch (err) {
            res.status(400).send("")
            return
        }

        if (!('quotes' in pet)) { pet.quotes = {} }
        pet.quotes[data.productVariant] = {
            id: newQuote.id,
            cost: newQuote.cost,
            percent: newQuote.percent,
            period: newQuote.period,
        }
        pet.quoteIds = Object.values(pet.quotes).map(val => val.id )
        try {
            const result = await db.database(database).container(container).item(data.petId, data.petId).replace(pet)
            if (result.statusCode == 200) {
                pet = result.resource
            } else {
                res.status(result.statusCode).send("")
                return
            }
        } catch (err) {
            res.status(500).send("")
            return
        }

        res.status(201).send({
            ...newQuote,
            petId: pet.id,
            petName: pet.name
        })
    })

    router.get('/', async (req, res, next) => {
        const validation = validate(schemas.listQuotes, req.query)
        if (validation !== undefined) { res.status(400).send(validation); return }

        const db = config.dbClient
        const database = config.dbParams.database
        const container = config.dbParams.container

        let pet = {}
        try {
            let quotes = req.query.id.map(id => `ARRAY_CONTAINS(r.quoteIds, '${id}')`)
            const querySpec = {
                query: 'SELECT * FROM r WHERE ' + quotes.join(' AND ')
            }
            const result = await db.database(database).container(container).items.query(querySpec).fetchAll()
            if (result && result.resources) {
                if (result.resources.length == 0) {
                    res.status(404).send("")
                    return
                }
                pet = result.resources[0]
            } else {
                res.status(500).send("")
                return
            }
        } catch (err) {
            res.status(500).send("")
            return
        }

        let response = {
            quotes: {},
            pet: {}
        }
        Object.keys(pet.quotes).forEach(key => {
            response.quotes[key] = {
                ...pet.quotes[key],
                petId: pet.id,
                petName: pet.name
            }
        })

        response.pet = {
            id: pet.id,
            name: pet.name,
            breed: pet.breed,
            height: pet.height,
            birthDate: pet.birthDate,
            preferredPlan: pet.preferredPlan
        }

        res.status(200).send(response)
    })

    return router
}

module.exports = routerWrapper