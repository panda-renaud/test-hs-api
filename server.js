require('dotenv').config()

const createError = require('http-errors');
const express = require('express');
const proxy = require('express-http-proxy');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const hubspot = require('@hubspot/api-client')

const indexRouter = require('./routes/index');
const petsRouter = require('./routes/pets');
const quotesRouter = require('./routes/quotes');
const requestsRouter = require('./routes/requests')

const app = express();

const config = require('./config');
const key = fs.readFileSync(path.join(__dirname, config.keyFile), { encoding: 'utf8', flag: 'r' });

const dbConfig = require('./config/db');
const { CosmosClient } = require('@azure/cosmos');
const dbClient = new CosmosClient({
    endpoint: dbConfig.endpoint,
    key: dbConfig.key
});

const hubspotConfig = require('./config/hubspot')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
 * Plug for test deployent
 */

app.use(cors({
    origin: '*'
}));

app.use('/health', indexRouter({ key, paymentInfo: config.paymentInfo }));

app.use('/pets', petsRouter({
    dbClient,
    dbParams: { database: dbConfig.database, container: dbConfig.container },
    apiConfig: { url: config.proxyUrl, key }
}));
app.use('/quotes', quotesRouter({
    dbClient,
    dbParams: { database: dbConfig.database, container: dbConfig.container },
    apiConfig: { url: config.proxyUrl, key }
}));
app.use('/requests', requestsRouter({
    ...hubspotConfig
}))

app.use('*', (req, res, next) => {

    delete req.headers['user-agent'];
    delete req.headers['origin'];
    delete req.headers['referer'];
    req.headers['Authorization'] = `Key ${(key || '').trim()}`;

    console.log(`--------------------------${new Date().toISOString()}--------------------------`);
    console.log('Req url: ', req.url);
    console.log('proxyUrl', config.proxyUrl);
    console.log('Req body: ', req.body);
    console.log('Headers: ', req.headers);
    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
    console.log(`------------------------------${ip}------------------------------`);

    next();
});

app.use('/', proxy(config.proxyUrl, {
    proxyErrorHandler(err, res, next) {
        switch (err && err.code) {
            case 'ECONNRESET': { return res.status(405).send('504 became 405'); }
            case 'ECONNREFUSED': { return res.status(200).send('gotcher back'); }
            default: { next(err); }
        }
    }
}));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
