import { Client } from "@googlemaps/google-maps-services-js";
import { Blob } from "buffer";
import axios from "axios";

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Constructs a FormData object for an object with photos.
 *
 * @param {Object} object - The object data.
 * @param {Array<File|Blob>} photos - An array of File or Blob objects.
 * @param prefix
 * @param formData
 * @returns {FormData}
 */
function constructFormData(object, photos, prefix = "", formData = new FormData()) {
    for (const key in object) {
        if (typeof object[key] === 'object' && object[key] !== null) {
            // Recursively process nested objects.
            constructFormData(object[key], [], `${prefix}${key}.`, formData);
        } else {
            // Use the prefix to maintain the nesting in the key.
            formData.append(`${prefix}${key}`, object[key]);
        }
    }

    // Append each photo under the "pictures" key.
    // If you have multiple photos, use the same key name so Spring maps them as an array.
    for (const photo of photos) {
        let fileToAppend = photo;

        // If photo is a Buffer, convert it to a Blob.
        if (Buffer.isBuffer(photo)) {
            // You may need to adjust the MIME type if it isn't a JPEG.
            fileToAppend = new Blob([photo], { type: "image/jpeg" });
        }

        // Append the photo. The third parameter is the filename.
        formData.append("pictures", fileToAppend, "photo.jpg");
    }

    return formData;
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

            // Construct form data
            const formData = constructFormData({
                name: place.name,
                description: description[0].toUpperCase() + description.slice(1),
                categoryId: type ?? place.types.at(0),
                rating: place.rating ?? 0,
                location: {
                    address: address.join(", "),
                    city,
                    country: "Ukraine", // for now
                    coordinate: {
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                    }
                }
            }, photos);

            // Send request to the backend
            await axios.postForm(
                "http://localhost:8080/api/places",
                formData,
                {
                    timeout: 2 * 60 * 1000, // 2 minutes
                }
            ).then(({data}) => console.log(data));
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
