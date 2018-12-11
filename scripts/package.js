const { promisify } = require('util');
const fs = require('fs');
const fsExtra = require('fs-extra');
const packPluginFromManifest = require('@kintone/plugin-packer/src/pack-plugin-from-manifest');

(async () => {

    let privateKey;
    if (await promisify(fsExtra.pathExists)('./key/private.ppk')) {
        privateKey = await promisify(fs.readFile)('./key/private.ppk');
    }

    const output = await packPluginFromManifest('./plugin/manifest.json', privateKey);

    console.log(output.id);

    await fsExtra.mkdirp('./key');
    await promisify(fs.writeFile)('./key/private.ppk', output.privateKey);

    await fsExtra.mkdirp('./dist');
    await promisify(fs.writeFile)('./dist/plugin.zip', output.plugin);

})();
