// remote.js should be started with it's cwd in the strapi project's root

const Strapi = require('@strapi/strapi');

(async () => {
    const base = await Strapi({
        distDir: 'dist',
    });
    // Do not remove log.error since it writes to stderr
    base.log.warn = () => {};
    base.log.info = () => {};

    const instance = await base.load();

    await instance.server.mount();

    console.log(JSON.stringify([instance.contentTypes, instance.components]));

    const dbSettings = instance.config.get('database.connection');

    //close server to release the db-file
    await instance.server.httpServer.close();

    // close the connection to the database before deletion
    await instance.db.connection.destroy();

    // Force exit, because else it hangs
    process.exit(0);
})();
