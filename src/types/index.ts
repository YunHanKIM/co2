// 공통 타입 정의


//companies
type Company = {
    id: string;
    name: string;
    country: string; // Country.code
    emissions: GhgEmissions[];
};

//Emission
type GhgEmissions = {
    yearMonth: string; // "2025-01", "2025-02", "2025-03"
    source: string; // gasoline, lpg, diesel, etc
    emmissions: number; // tons of CO2 equivalent
};

//Posts
type Post = {
    id: string;
    title: string;
    resource: string; // Company.id
    dateTime: string; // e.g., "2024-02"
    content: string;
}