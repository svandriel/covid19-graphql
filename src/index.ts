import { last } from 'ramda';

import { fetchAllStats } from './fetch-covid-csv';
import { mergeStats } from './merge-stats';
import { StatsType } from './types/stats-type';
import { DailyStat } from './types/time-series';
import { mergeDailyState } from './merge-daily-stat';
import chalk from 'chalk';

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
}
