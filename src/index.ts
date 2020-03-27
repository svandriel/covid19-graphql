import chalk from 'chalk';
import { isNil } from 'ramda';

import { startServer } from './server';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 12000;
const isProduction = process.env.NODE_ENV === 'production';

const enablePlayground = isNil(process.env.ENABLE_PLAYGROUND) ? !isProduction : process.env.ENABLE_PLAYGROUND === '1';
const enableTracing = isNil(process.env.ENABLE_TRACING) ? !isProduction : process.env.ENABLE_TRACING === '1';

main().catch(err => {
    console.error(err);
    process.exit(1);
});

async function main(): Promise<void> {
    await startServer({
        port,
        enableTracing,
        enablePlayground,
    });
    const url = `http://localhost:${port}`;
    console.log(`🚀 Server ready at ${chalk.cyan(url)}`);
    if (enablePlayground) {
        console.log(`🕹  ${chalk.cyan('Enabled playground')}`);
    }
    if (enableTracing) {
        console.log(`📊 ${chalk.cyan('Enabled tracing')}`);
    }
}
