const apiBaseURL = 'https://api.openf1.org/v1';

export async function meetings(year){
    try{
        let meetings = await fetch(`${apiBaseURL}/meetings?year=${year}`);
        if(!meetings.ok){
            if (!meetings.status === 500) {
                return 500;
            } else if (meetings.status === 429) {
                return 429;
            } else {
                return 0;
            }
        }
        else{
            return await meetings.json();
        }
    }
    catch (error){
        console.log(error);
        if (error.name === "AbortError") {
            return 600;// Abort Error
        } else if (error instanceof TypeError && error.message === "Failed to fetch") {
            return 601; // Server Error
        } else {
            return 666; // Other errors
        }
    }
    
}

