module.exports = {
    name: 'OpenMapKit Server',
    description: 'OpenMapKit Server is the lightweight server component of OpenMapKit that handles the collection and aggregation of OpenStreetMap and OpenDataKit data.',
    port: 3210,
    dataDir: __dirname + '/data',
    pagesDir: __dirname + '/pages',
    hostUrl: 'http://omkserver.com',
    osmApi: {
        server: 'https://www.openstreetmap.org/api',
        user: 'POSM',
        pass: ''
    }

    // To do simple authentication, you can have an object like so:
    // auth: {
    //     user: 'username',
    //     pass: 'password'
    // }
    
};
