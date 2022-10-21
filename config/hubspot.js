var config = {
    apiKey: process.env.HUBSPOT_API_KEY,
    portalId: process.env.HUBSPOT_PORTAL_ID,
    messagesFormGuid: process.env.HUBSPOT_MESSAGES_FORM_GUID,
    restoreQuotesFormGuid: process.env.HUBSPOT_RESTORE_QUOTES_FORM_GUID,
    callbackFormGuid: process.env.HUBSPOT_CALLBACK_FORM_GUID
}

module.exports = config
