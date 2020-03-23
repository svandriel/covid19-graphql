import chalk from 'chalk';

import { startServer } from './server';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 12000;
const isProduction = process.env.NODE_ENV === 'production';

main().catch(err => {
    console.error(err);
    process.exit(1);
});

async function main(): Promise<void> {
    await startServer({
        port,
        isProduction
    });
    const url = `http://localhost:${port}`;
    console.log(`🚀  Server ready at ${chalk.cyan(url)}`);
}
