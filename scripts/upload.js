var os = require('os');
var spawn = require('child_process').spawn;
var versions = require('../node_versions.json');

var ROOT = process.cwd();
var NVM = (os.platform() == 'win32') ? 'nvmw.bat' : process.env['NVM_DIR'] + '/nvm-exec';
var NPM = (os.platform() == 'win32') ? 'npm.cmd' : 'npm';

process.env['BUILD_WEBRTC'] = 'true';

function build(callback) {
  var res = spawn(NPM, [ 'install' ], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit',
  });
  
  res.on('close', function (code) {
    callback(code == 0);
  });
}

function prep(version, callback) {
  var res = spawn(NVM, [ 'use', version ], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit',
  });

  res.on('close', function (code) {
    if (!code) {
      build(callback);
    }
    
    callback(false);
  });
}

function install(version, callback) {
  var res = spawn(NVM, [ 'install', version ], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit',
  });

  res.on('close', function (code) {
    prep(version, callback);
  });
}

function buildNext(index) {
  if (index < versions.length) {
    install(versions[index], function(result) {
      if (result) {
        buildNext(index + 1);
      }
    });
  }
}

buildNext(0);
