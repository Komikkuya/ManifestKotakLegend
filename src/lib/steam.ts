export interface SteamGameDetails {
  success: boolean;
  data: {
    name: string;
    header_image: string;
    short_description: string;
    background: string;
    developers: string[];
    publishers: string[];
    price_overview?: {
      final_formatted: string;
    };
  };
}

export async function getSteamGameDetails(appId: string): Promise<SteamGameDetails | null> {
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const data = await response.json();
    
    if (data[appId] && data[appId].success) {
      return data[appId];
    }
    return null;
  } catch (error) {
    console.error("Error fetching Steam game details:", error);
    return null;
  }
}
