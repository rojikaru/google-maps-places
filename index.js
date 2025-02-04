import { Client } from "@googlemaps/google-maps-services-js";
import { Blob } from "buffer";
import axios from "axios";

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
