process.kill(primaryProcessId, 'SIGUSR1')

const primaryProcessId = (await fs.readFile('primary.pid', 'utf-8')).trim()
const { version } = JSON.parse(await fs.readFile('./package.json', 'utf-8'))
const environment = process.env.ENV

console.log(`
We just sent SIGUSR1 to the primary process with pid: ${primaryProcessId}.
Version: ${version}, environment: ${environment}.

Then primary process will send message to its subprocesses to exit with code 0.
It will restart them (gracefully and with timeout one by one).
That will allow to reach zero downtime while we restarting the application with new codebase (everything in worker.js).

P.S.: If you need to update primary.js as well, you need to shutdown whole application and run it again.
`)
