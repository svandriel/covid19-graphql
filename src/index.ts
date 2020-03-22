import chalk from 'chalk';
import { last } from 'ramda';

import { fetchAllStats } from './fetch-covid-csv';
import { mergeDailyState } from './merge-daily-stat';
import { mergeStats } from './merge-stats';
import { startServer } from './server';
import { StatsType } from './types/stats-type';
import { DailyStat } from './types/time-series';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 12000;
const isProduction = process.env.NODE_ENV === 'production';

main().catch(err => {
    console.error(err);
    process.exit(1);
});

async function main(): Promise<void> {
    const stats = mergeStats(await fetchAllStats());
    const latest = Object.values(stats).flatMap(perState => Object.values(perState).flatMap(x => last(x.items)!!));
    const total = latest.reduce((a, b): DailyStat => mergeDailyState(a, b.value), {
        [StatsType.Confirmed]: 0,
        [StatsType.Deceased]: 0,
        [StatsType.Recovered]: 0
    } as DailyStat);
    console.log(`Covid-19 current state:`);
    console.log(`  Confirmed: ${chalk.cyan(total[StatsType.Confirmed])}`);
    console.log(`  Deceased:   ${chalk.gray(total[StatsType.Deceased])}`);
    console.log(`  Recovered:  ${chalk.green(total[StatsType.Recovered])}`);

    await startServer({
        port,
        isProduction
    });
    const url = `http://localhost:${port}`;
    console.log(`🚀  Server ready at ${chalk.cyan(url)}`);
}
