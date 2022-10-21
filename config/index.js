module.exports = {
    appPort: process.env.APP_PORT,
    proxyUrl: process.env.APP_PROXY_URL,
    keyFile: process.env.APP_KEY_FILE,
    paymentInfo: {
        accountHolder: process.env.APP_ACCOUNT_HOLDER,
        iban: process.env.APP_IBAN,
    },
};
