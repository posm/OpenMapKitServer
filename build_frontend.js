const args = [ 'build' ];
const opts = { stdio: 'inherit', cwd: 'frontend', shell: true };
require('child_process').spawn('yarn', args, opts);
