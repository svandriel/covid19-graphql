import { StatsType } from './types/stats-type';
import { DailyStat } from './types/time-series';

export function mergeDailyState(a: DailyStat, b: DailyStat): DailyStat {
    return {
        [StatsType.Confirmed]: a[StatsType.Confirmed] + b[StatsType.Confirmed],
        [StatsType.Deceased]: a[StatsType.Deceased] + b[StatsType.Deceased],
        [StatsType.Recovered]: a[StatsType.Recovered] + b[StatsType.Recovered]
    };
}
