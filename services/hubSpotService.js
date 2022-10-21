const axios = require('axios')
const config = require('../config/hubspot')

class HubSpotService {
    #portalId

    constructor(portalId) {
        this.#portalId = portalId
    }

    #prepareData(data, ip, hutk) {
        let fields = []
        Object.keys(data).forEach(key => {
            fields.push({
                "objectTypeId": "0-1",
                "name": key,
                "value": data[key]
            })
        })

        let result = {
            fields,
            context: {
                // ipAddress: ip,
                hutk
            }
        }

        return result
    }

    async postForm(formGuid, data, ip, hutk) {
        return axios({
            method: 'post',
            url: `https://api.hsforms.com/submissions/v3/integration/submit/${this.#portalId}/${formGuid}`,
            data: this.#prepareData(data, ip, hutk)
        })
    }
}

module.exports = new HubSpotService(config.portalId)