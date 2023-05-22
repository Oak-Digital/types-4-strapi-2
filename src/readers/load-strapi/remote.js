// remote.js should be started with it's cwd in the strapi project's root

const Strapi = require('@strapi/strapi');

(async () => {
    const instance = await Strapi({
        distDir: 'dist',
    }).load();

    await instance.server.mount();

    console.log(JSON.stringify([instance.contentTypes, instance.components]));

    const dbSettings = instance.config.get('database.connection');

    //close server to release the db-file
    await instance.server.httpServer.close();

    // close the connection to the database before deletion
    await instance.db.connection.destroy();

    process.exit(0);
})();
