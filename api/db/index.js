const DBMigrate = require('db-migrate');

let instance;

async function createInstance() {
    const instance = DBMigrate.getInstance(true, {
        cwd: __dirname,
        throwUncatched: true,
    });
    await instance.registerAPIHook();

}

export async function migrate(...args) {
    if (!instance) {
        instance = await createInstance();
    }

    return instance.up(...args);
}

export async function createDatabase(name) {
    if (!instance) {
        instance = await createInstance();
    }

    return instance.createDatabase(name);
}

export async function dropDatabase(name) {
    if (!instance) {
        instance = await createInstance();
    }

    return instance.dropDatabase(name);
}