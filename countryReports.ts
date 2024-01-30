export interface CountryReports { 
    [key: string]: any;
    country: string;
    continent: string;
    cases: number;
    todayCases: number;
    deaths: number;
    todayDeaths: string;
    recovered: number;
    active: number;
    critical: string;
    casesPerOneMillion: number;
    deathsPerOneMillion: number;
    tests: number;
    testsPerOneMillion: number;
    population:number;
    comment?: string;
}


