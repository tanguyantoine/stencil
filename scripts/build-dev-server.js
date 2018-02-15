const fs = require('fs-extra');
const path = require('path');
const rollup = require('rollup');
const glob = require('glob');


const TRANSPILED_DIR = path.join(__dirname, '../dist/transpiled-dev-server');
const ENTRY_FILE = path.join(TRANSPILED_DIR, 'dev-server/index.js');
const DEST_DIR = path.join(__dirname, '../dist/dev-server');
const DEST_FILE = path.join(DEST_DIR, 'index.js');

fs.ensureDirSync(DEST_DIR);

function bundleDevServer() {
  rollup.rollup({
    input: ENTRY_FILE,
    external: [
      'crypto',
      'fs',
      'http',
      'https',
      'net',
      'path',
      'os',
      'url'
    ],
    onwarn: (message) => {
      if (/top level of an ES module/.test(message)) return;
      console.error( message );
    }

  }).then(bundle => {

    bundle.write({
      format: 'cjs',
      file: DEST_FILE

    }).catch(err => {
      console.log(`build dev.server error: ${err}`);
      process.exit(1);
    });
  });
}


function createContentTypeData() {
  // create a focused content-type lookup object from
  // the mime db json file
  const mimeDbSrcPath = glob.sync('db.json', {
    cwd: path.join(__dirname, '../node_modules/mime-db'),
    absolute: true
  });
  if (mimeDbSrcPath.length !== 1) {
    throw new Error(`build-dev-server cannot find mime db.json`);
  }
  const contentTypeDestPath = path.join(DEST_DIR, 'content-type-db.json');

  const mimeDbJson = fs.readJsonSync(mimeDbSrcPath[0]);
  const exts = {};
  Object.keys(mimeDbJson).forEach(mimeType => {
    const mimeTypeData = mimeDbJson[mimeType];
    if (Array.isArray(mimeTypeData.extensions)) {
      mimeTypeData.extensions.forEach(ext => {
        exts[ext] = mimeType;
      });
    }
  });
  fs.writeJsonSync(contentTypeDestPath, exts);
}


bundleDevServer();
createContentTypeData();

process.on('exit', (code) => {
  fs.removeSync(TRANSPILED_DIR);
  console.log(`✅ dev.server: ${DEST_FILE}`);
});
