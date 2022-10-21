const axios = require('axios')
const moment = require('moment-timezone')

const productId = 'ba11c622-2fb1-40cf-afdf-b3d38aa45126';

const getCoverDate = () => {
    const data = moment().tz('Europe/Berlin').add(1, 'days').startOf('day');
    return data.toISOString();
};

const getBreed = (pet) => {
    const firstBreed = pet.breed.firstBreed
    const secondBreed = pet.breed.secondBreed
    const height = pet.height
    let bredData = {};

    if ([firstBreed, secondBreed].includes('unknown')) {
        bredData.shoulderHeight = height;
    }

    if (firstBreed && secondBreed) {
        return {
            ...bredData,
            firstBreed,
            mixedBreed: true,
            secondBreed
        }
    }

    return {
        ...bredData,
        firstBreed,
        mixedBreed: false
    };
}

const createQuote = async (pet, data, apiConfig) => {
    const quoteData = {
        'elements': [{
            'name': 'pet-health',
            'attributes': {
                'deductibleRate': data.percent,
                'productVariant': data.productVariant
            },
            'coverStart': data.coverStart || getCoverDate(),
            'insuredEntities': [
                {
                    'attributes': {
                        'birthDate': pet.birthDate,
                        ...getBreed(pet)
                    },
                    'id': pet.id,
                    'type': 'DOG'
                }
            ]
        }],
        'payment': {
            'frequency': {
                'period': 1,
                'unit': data.period
            }
        },
        'productId': productId
    }

    let newQuote = {}
    try {
        let result = await axios({
            method: 'post',
            url: apiConfig.url + '/quotes',
            data: quoteData,
            headers: {
                Authorization: `Key ${(apiConfig.key || '').trim()}`
            }
        })
        newQuote = {
            id: result.data.id,
            cost: result.data.payment.premium,
            percent: data.percent,
            period: result.data.payment.frequency.unit,
            productVariant: data.productVariant
        }
    } catch (err) {
        throw err
    }

    return newQuote
}

module.exports = {
    create: createQuote
}