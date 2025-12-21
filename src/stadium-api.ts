export interface StadiumData {
    stadium: {
        spaces: {
            commercial: number,
            supporters: number,
            toilets: number,
            parking: number,
            sidelineAdv: number
        },
        name: String,
        health: {
            medicalCenter: number,
            physio: number
        },
        pitch: {
            maintenance: number,
            sprinklers: number,
            lights: number,
            cover: number,
            heating: number
        },
        seasTktsPercentage: {
            sta: number,
            std: number,
            cov: number,
            vip: number
        },
        seasTkts: {
            sta: number,
            std: number,
            cov: number,
            vip: number,
            tot: number
        },
        stands: {
            sta: number,
            std: number,
            cov: number,
            vip: number,
            tot: number
        }
    },
    isOwner: boolean,
    teamID: number,
    seatBuilding: any[],
    standingPlacePrice: number
}

export async function getStadiumData(): Promise<StadiumData | undefined> {
    try {
        const response = await fetch('/Economy/Stadium?handler=StadiumData');
        if (!response.ok) throw new Error('Network response was not ok');
        const data: StadiumData = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stadium data:', error);
        return undefined;
    }
}
