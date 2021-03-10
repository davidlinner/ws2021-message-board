const express = require('express')
const {readFile, writeFile, existsSync, readdir, mkdirSync, rm} = require('fs')
const {slugify, readAllFiles} = require('./tools');
const path = require('path')

const exphbs = require('express-handlebars');

const CHANNEL_DIR = path.join(__dirname, 'channels');
const FILE_OPTIONS = {encoding: 'utf8'};

const app = express()
const port = 3000

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use('/static', express.static('./public'));
app.use(express.urlencoded());

const {stringify, parse} = JSON;

const generalChannelFileName = path.join(CHANNEL_DIR, 'general.json');

// Let's create the general channel on first start-up
if (!existsSync(generalChannelFileName)) {
    // and if the "channels" directory does not exist, create it as well
    if (!existsSync(CHANNEL_DIR)) {
        mkdirSync(CHANNEL_DIR)
    }

    const general = {
        title: 'General',
        messages: []
    };

    writeFile(generalChannelFileName, stringify(general), FILE_OPTIONS, (error) => {
        if (error) {
            console.error('Cannot create general channel.', error)
        } else {
            console.log('Initialized empty general channel...')
        }
    });
}

/**
 * Convenience method wrapping fs callbacks to return 500 on each error
 * @param response
 * @returns {function(*): function(*=, ...[*]): void}
 */
const failFastOnError = response => callback => (error, ...other) => {
    if (error) {
        console.error(error);
        response.sendStatus(500);
    } else {
        callback(...other);
    }
}

app.get('/', (request, response) => {
    response.redirect('/channels/general');
})


app.get('/channels/:channelName', (request, response) => {

    const {channelName} = request.params;
    const isGeneral = channelName === 'general';

    const channelFileName = path.join(CHANNEL_DIR, `${channelName}.json`);

    if (!existsSync(channelFileName)) {
        response.status(404).end();
        return
    }

    readFile(channelFileName, FILE_OPTIONS, failFastOnError(response)(data => {
            const currentChannel = parse(data);

            readdir(CHANNEL_DIR, failFastOnError(response)(files => {
                const fullyQualifiedFiles = files.map(fileName => path.join(CHANNEL_DIR, fileName));
                readAllFiles(fullyQualifiedFiles, FILE_OPTIONS, failFastOnError(response)(contents => {
                    const allChannels = Object.entries(contents).map(([fileName, fileContent]) => {
                        const name = path.basename(fileName, '.json');
                        const {title = ''} = parse(fileContent);
                        const isCurrent = channelName === name;

                        return {name, title, isCurrent}
                    });

                    response.render('home', {channelName, currentChannel, allChannels, isGeneral});
                }));
            }));
        })
    );
})


app.post('/channels/:channelName/add', (request, response) => {

    const {channelName} = request.params;

    const {author, text} = request.body;

    const message = {
        author,
        text
    }

    const channelFileName = path.join(CHANNEL_DIR, `${channelName}.json`);

    if (!existsSync(channelFileName)) {
        response.status(404).end();
        return
    }

    readFile(
        channelFileName,
        FILE_OPTIONS, failFastOnError(response)(text => {
            const {title, messages = []} = parse(text);
            const channel = {
                title,
                messages: [message, ...messages]
            }

            writeFile(channelFileName, stringify(channel, null, 2), FILE_OPTIONS, failFastOnError(response)(() => {
                response.redirect(`/channels/${channelName}`);
            }));
        }))
})


app.post('/channels/add', (request, response) => {

    const {title} = request.body;
    const name = slugify(title);

    const channelFile = path.join(CHANNEL_DIR, `${name}.json`);

    const channel = {
        title,
        messages: []
    };

    writeFile(channelFile, stringify(channel, null, 2), FILE_OPTIONS, failFastOnError(response)(() => {
        response.redirect(`/channels/${name}`);
    }));
});

app.post('/channels/remove', (request, response) => {

    const {channelName} = request.body;

    // we don't allow removing the general channel
    if (channelName === 'general') {
        response.sendStatus(400);
    }

    const channelFile = path.join(CHANNEL_DIR, `${channelName}.json`);

    rm(channelFile, failFastOnError(response)(() => {
        response.redirect(`/channels/general`);
    }));
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
