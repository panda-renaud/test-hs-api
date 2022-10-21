const express = require('express')
const joi = require('joi')
const crypto = require('crypto')

const schemas = require('../utils/schemas')
const quoteUtils = require('../utils/quotes')
const validate = require('../utils/validation')

const router = express.Router()

function routerWrapper(config) {
    router.post('/', async (req, res, next) => {
        const validation = validate(schemas.newPet, req.body)
        if (validation !== undefined) { res.status(400).send(validation); return }

        let newPet = req.body
        newPet.id = crypto.randomUUID()

        const quoteParams = [
            { period: 'MONTH', percent: 0.4, productVariant: 'S', petId: newPet.id },
            { period: 'MONTH', percent: 0.2, productVariant: 'M', petId: newPet.id },
            { period: 'MONTH', percent: 0.2, productVariant: 'L', petId: newPet.id }
        ]
        let newQuotes = []
        try {
            newQuotes = await Promise.all(quoteParams.map(data => { return quoteUtils.create(newPet, data, config.apiConfig) }))
        } catch (err) {
            res.status(500).send("")
            return
        }

        newPet.quoteIds = newQuotes.map(quote => quote.id)

        newPet.quotes = {}
        newQuotes.forEach(newQuote => {
            newPet.quotes[newQuote.productVariant] = {
                id: newQuote.id,
                cost: newQuote.cost,
                percent: newQuote.percent,
                period: newQuote.period,
                petId: newPet.id,
                petName: newPet.name
            }
        })

        try {
            const { item } = await config.dbClient.database(config.dbParams.database).container(config.dbParams.container).items.upsert(newPet)
        } catch (err) {
            res.status(500).send("")
            return
        }

        res.status(201).send({
            id: newPet.id,
            name: newPet.name,
            quotes: newPet.quotes
        })
    })
    return router
}

module.exports = routerWrapper