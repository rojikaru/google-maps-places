# Google Maps Places Data Fetcher & Uploader

This repository contains a Node.js script that uses the Google Maps Places API to fetch data about various places near a specified location, process the results (including downloading associated photos), and upload the information to a backend server via a multipart/form-data request.

## Features

- **Google Maps API Integration**: Fetches nearby places based on type and location.
- **Photo Retrieval**: Downloads photos for each place using the Google Maps Place Photo API.
- **Dynamic FormData Construction**: Recursively builds a `FormData` object including both text fields and binary image data.
- **Backend Upload**: Posts the processed data to a backend endpoint.
- **Pagination Handling**: Processes paginated results using the `next_page_token`.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or later recommended)
- A valid Google Maps API key with access to the Places API.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rojikaru/google-maps-places.git
    cd google-maps-places
    ```
2. **Install the dependencies:**
    
   ```bash
   npm install
   ```

3. **Create a `.env` file in the root directory of the project:**

   ```bash
   touch .env
   nano .env
   ```
   
4. **Add the following environment variables to the `.env` file:**

   ```env
   GOOGLE_MAPS_API_KEY=YOUR_API_KEY
   BACKEND_URL=YOUR_BACKEND_URL
   ```

5. **Save and close the `.env` file.**
6. **Run the script:**

   ```bash
   npm start
   ```

## Code Overview
### constructFormData(object, photos, prefix, formData):
Recursively processes an object to append its keys and values to a FormData object. It also appends an array of photos (handling Buffer-to-Blob conversion when necessary).

### processRequest(client, key, geocode, type, sleepMillis):
Queries the Google Maps Places API for a given place type, processes the results (including photo retrieval), constructs form data, and uploads it to the backend. Handles pagination via the next_page_token.

### main():
Iterates through a list of predefined place types, calling processRequest for each type to gather and upload the data.

## Customization
### Geolocation:
Update the geocode variable in the main() function to target a different location.

### Place Types:
Modify the types array in main() to query different or additional categories of places.

### Backend Endpoint:
Change the URL in the axios POST request if your backend endpoint is different.

## Troubleshooting
### API Quotas and Limits:
If you encounter OVER_QUERY_LIMIT errors, consider increasing the delay between requests (adjust the sleepMillis parameter) or review your API usage limits.

### Environment Variables:
Double-check your .env file to ensure the GOOGLE_MAPS_API_KEY is correctly set and has the necessary permissions.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request if you have suggestions, improvements, or bug fixes.

## Acknowledgements
- Google Maps Platform
- axios
- Node.js
