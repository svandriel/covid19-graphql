export interface EsriQuery {
    offset?: number;
    count?: number;
    outFields?: string[];
    orderBy?: Record<string, 'asc' | 'desc'>;
    where?: string;
}

export interface EsriResponse<T> {
    objectIdFieldName: string;
    uniqueIdField: {
        name: string;
        isSystemMaintained: boolean;
    };
    globalIdFieldName: string;
    geometryType?: string;
    spatialReference: {
        wkid: number;
        latestWkid: number;
    };
    fields: ReadonlyArray<{
        name: string;
        type: string;
        alias: string;
        sqlType: string;
        length?: number;
        domain: any;
        defaultValue: any;
    }>;
    exceededTransferLimit: boolean;
    features: ReadonlyArray<{
        attributes: T;
    }>;
}

export interface EsriCurrentStat {
    OBJECTID: number;
    Country_Region: string;
    Last_Update: number;
    Lat: number;
    Long_: number;
    Confirmed: number;
    Deaths: number;
    Recovered: number;
    Active: number;
    Incident_Rate: number | null;
    People_Tested: number | null;
}

export interface EsriHistoryStat {
    OBJECTID: number;
    Country_Region: string;
    Last_Update: number;
    Confirmed: number;
    Deaths: number;
    Recovered: number | null;
    Active: number | null;
    Delta_Confirmed: number;
    Delta_Recovered: number | null;
    Incident_Rate: number | null;
    People_Tested: number | null;
}
