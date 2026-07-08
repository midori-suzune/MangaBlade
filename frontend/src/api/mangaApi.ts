import type {MangaResponse} from "../types/manga.ts";

export async function getManga(): Promise<MangaResponse> {
    const response = await fetch(`http://localhost:8080/api/v1/manga`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}
