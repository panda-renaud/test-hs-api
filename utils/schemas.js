const joi = require('joi');
const enums = require('./enums');

const newPet = joi.object().keys({
    name: joi.string().min(1).max(100).required(),
    breed: joi.object().keys({
        firstBreed: joi.string().min(1).max(100).required(),
        secondBreed: joi.string().min(1).max(100).when('isMixed', {
            is: true,
            then: joi.required(),
            otherwise: joi.optional()
        }),
        isMixed: joi.boolean().required()
    }).required(),
    height: joi.string().valid(...Object.values(enums.Height)),
    birthDate: joi.date().required(),
    preferredPlan: joi.string().valid(...Object.values(enums.Plan)).required()
});

const newQuote = joi.object().keys({
    petId: joi.string().uuid().required(),
    period: joi.string().valid(...Object.values(enums.Period)).required(),
    productVariant: joi.string().valid(...Object.values(enums.Plan)).required(),
    percent: joi.number().valid(0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9),
    coverStart: joi.date()
});

const listQuotes = joi.object().keys({
    id: joi.array().items(joi.string().uuid()).unique().min(1).max(3).required()
});

const newMessageRequest = joi.object().keys({
    name: joi.string().min(1).max(100).required(),
    email: joi.string().email().required(),
    message: joi.string().min(1).max(2000).required(),
    hubspotutk: joi.string().min(1).optional()
});

const newRestoreQuotesRequest = joi.object().keys({
    email: joi.string().email().required(),
    link: joi.string().uri().required(),
    hubspotutk: joi.string().min(1).optional()
});

const newCallbackRequest = joi.object().keys({
    name: joi.string().min(1).max(100).required(),
    email: joi.string().email().required(),
    phone: joi.string().min(6).max(20).required(),
    time: joi.string().min(1).max(100),
    hubspotutk: joi.string().min(1).optional()
});

module.exports = {
    newPet,
    newQuote,
    listQuotes,
    newMessageRequest,
    newRestoreQuotesRequest,
    newCallbackRequest
};
