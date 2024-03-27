export interface Asset {
    id: number;
    name: string;
    lng: number;
    lat: number;
    pinpoint: string;
}

export const ASSETS: Asset[] = [
    { id: 0, name: 'Asset 1', lng: 1.3704187984372747, lat: 43.638081121514034, pinpoint: 'default-available-background' },
    { id: 1, name: 'Asset 2', lng: 1.3455278985815584, lat: 43.62988114261228, pinpoint: 'default-available-background' },
    { id: 2, name: 'Asset 3', lng: 1.3014109243545302, lat: 43.624165344130944, pinpoint: 'default-available-background' },
    { id: 3, name: 'Asset 4', lng: 1.4634592654841592, lat: 43.63298732686791, pinpoint: 'default-available-background' },
    { id: 4, name: 'Asset 5', lng: 1.3128351070875164, lat: 43.58399795513883, pinpoint: 'default-available-background' },
    { id: 5, name: 'Asset 6', lng: 0.8797538523821354, lat: 43.51147382867539, pinpoint: 'default-available-background' },
    { id: 6, name: 'Asset 7', lng: -0.6213875632991992, lat: 44.807808780878226, pinpoint: 'default-available-background' },
];
