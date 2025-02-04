import { Client } from "@googlemaps/google-maps-services-js";

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processRequest(client, key, geocode, type, sleepMillis = 2000) {
    let next_page_token = null;
    do {
        await sleep(sleepMillis); // Sleep 2 seconds to avoid OVER_QUERY_LIMIT
        const {data} = await client.placesNearby({
            params: {
                key,
                location: geocode,
                radius: 20000,
                type,
                rankby: "prominence",
                pagetoken: next_page_token,
            },
        });

        if (data.status !== "OK") {
            throw new Error(`API Error: ${data.status}`);
        }

        const places = data.results;
        console.log(
            `Found ${places.length} places:`,
            `\n${places.map((p) => p.name).join(", ")}`
        );

        // Send places to the database
        for (const place of places) {
            const address = place.vicinity.split(", ");
            const city = address.pop();
            const description = place.types.join(", ").replace(/_+/g, " ");

            // Obtain photos
            const photoResponses = await Promise.all(
                (place.photos || []).map((photo) =>
                    client.placePhoto({
                        params: {
                            key,
                            photoreference: photo.photo_reference,
                            maxheight: photo.height,
                            maxwidth: photo.width,
                        },
                        // Optionally, specify responseType if needed:
                        responseType: "arraybuffer",
                    })
                )
            );
            // Extract the Buffer data from each response.
            const photos = photoResponses.map((response) => response.data);

            console.log(places, photos);
        }

        next_page_token = data.next_page_token;
    } while (next_page_token);
}

async function main() {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    const geocode = "49.84192168117031, 24.03155221956153"; // Lviv, Ukraine

    // amusement places
    // https://developers.google.com/maps/documentation/places/web-service/supported_types
    const types = [
        "amusement_park",
        "aquarium",
        "art_gallery",
        "bar",
        "beauty_salon",
        // "bowling_alley",
        "casino",
        "museum",
        "night_club",
        "park",
        "stadium",
        "shopping_mall",
        "spa",
        "zoo",
        "restaurant",
        // "rv_park",
        "campground",
    ];

    const client = new Client();

    for (const type of types) {
        await processRequest(client, key, geocode, type);
    }
}

main().catch(console.error);
