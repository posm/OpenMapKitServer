var spawn = require('child_process').spawnSync;
const opts = { stdio: 'inherit', cwd: 'frontend', shell: true };

const install = spawn('yarn', [ 'install' ], opts);
const build = spawn('yarn', [ 'build' ], opts);
