import mysql from 'mysql2/promise';
export declare const pool: mysql.Pool;
export declare function initDatabase(): Promise<boolean>;
export declare function executeQuery(query: string, params?: any[]): Promise<any>;
export declare function executeTransaction(queries: {
    query: string;
    params: any[];
}[]): Promise<any>;
//# sourceMappingURL=database.d.ts.map