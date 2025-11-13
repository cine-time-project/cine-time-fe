import { config } from "./config";
const API = config.apiURL;


export const API_BASE = API;
// -------------------- Auth --------------------
export const AUTH_LOGIN_API = `${API}/login`;
export const AUTH_GOOGLE_API = `${API}/google`;
export const AUTH_DEBUG_API = `${API}/_debug/auth`;

// -------------------- Users --------------------
// Authenticated user ops
export const USER_AUTH_PUT_API = `${API}/users/auth`;      // PUT
export const USER_AUTH_POST_API = `${API}/users/auth`;     // POST
export const USER_AUTH_DELETE_API = `${API}/users/auth`;   // DELETE
export const USER_INFORMATION_API = `${API}/user-information`; // GET (auth)

// Register & password
export const USER_REGISTER_API = `${API}/register`;                 // POST
export const USER_FORGOT_PASSWORD_API = `${API}/forgot-password`;   // POST
export const USER_RESET_PASSWORD_API = `${API}/reset-password`;     // POST
export const USER_RESET_PASSWORD_CODE_API = `${API}/reset-password-code`; // POST

// Admin list / admin check for a user
export const USERS_ADMIN_LIST_API = `${API}/users/admin`; // GET
export const userAdminCheckApi = (userId) => `${API}/users/${userId}/admin`; // GET

// Grant/Revoke admin (note: controller path is /api/{userId}/admin)
export const makeUserAdminApi = (userId) => `${API}/${userId}/admin`;    // PUT
export const revokeUserAdminApi = (userId) => `${API}/${userId}/admin`;  // DELETE

//List Users
export const USER_LIST_API = `${API}/users/admin/all`; // GET

// Update User By Id
export const userUpdateByIdApi = (userId) => `${API}/${userId}/admin`; // PUT

// -------------------- Contact Messages --------------------
export const CONTACT_CREATE_API = `${API}/contactmessages`; // POST
export const CONTACT_LIST_API = `${API}/contactmessages`; // GET (Admin/Employee)
export const contactMessageByIdApi = (id) => `${API}/contactmessages/${id}`; // GET/DELETE (Admin/Employee)

// -------------------- Cinemas --------------------
export const CINEMA_LIST_API = `${API}/cinemas`;            // GET
export const CINEMA_CREATE_API = `${API}/cinemas`;          // POST
export const cinemaByIdApi = (id) => `${API}/cinemas/${id}`;           // GET/PUT/DELETE
export const CINEMA_SPECIAL_HALLS_API = `${API}/special-halls`;        // GET
export const CINEMA_FAVORITES_AUTH_API = `${API}/favorites/auth`;      // GET
export const cinemaHallsApi = (id) => `${API}/cinemas/${id}/halls`;    // GET
export const cinemaHallsPricingApi = (id) => `${API}/cinemas/${id}/halls/pricing`;

// -------------------- Halls --------------------
export const HALL_LIST_API = `${API}/hall`;     // GET
export const HALL_CREATE_API = `${API}/hall`;   // POST
export const hallByIdApi = (hallId) => `${API}/hall/${hallId}`; // GET/PUT/DELETE


// -------------------- Special Hall Assignments (Hall + Type bağlama) --------------------
export const SPECIALHALL_ASSIGNMENTS_API = `${API}/special-hall-assignments`;                 // GET (paged) + POST
export const specialHallAssignmentByIdApi = (id) => `${API}/special-hall-assignments/${id}`;  // GET/PUT/DELETE

// -------------------- Special Hall Types --------------------
export const SPECIALHALL_TYPES_API = `${API}/special-hall-types`;
export const specialHallTypeByIdApi = (id) => `${API}/special-hall-types/${id}`;

export const SPECIAL_HALL_TYPES_API = `${API}/special-hall-types`;



// -------------------- Movies --------------------
export const MOVIE_SAVE_API = `${API}/movies/save`;                 // POST
export const movieUpdateApi = (movieId) => `${API}/movies/update/${movieId}`; // PUT
export const MOVIE_STATUS_API = `${API}/movies/status`;             // GET
export const moviesByCinemaSlugApi = (cinemaSlug) => `${API}/movies/slug/${cinemaSlug}`; // GET
export const MOVIE_SEARCH_API = `${API}/movies/search`;             // GET
export const MOVIE_FILTER_API = `${API}/movies/filter`;             // GET
export const MOVIES_IN_THEATRES_API = `${API}/movies/in-theatres`;  // GET
export const movieByIdApi = (movieId) => `${API}/movies/id/${movieId}`;      // GET
export const moviesByHallNameApi = (hallName) => `${API}/movies/hall/${hallName}`; // GET
export const MOVIE_BY_GENRE_API = `${API}/movies/genre`;          // GET
export const MOVIE_GENRE_LIST = `${API}/movies/genre-list`;          // GET
export const MOVIES_COMING_SOON_API = `${API}/movies/coming-soon`;  // GET
export const MOVIES_BY_CINEMA_DATE_API = `${API}/movies/by-cinema-date`; // GET
export const MOVIES_ADMIN_LIST_API = `${API}/movies/admin`;         // GET
export const movieDeleteApi = (movieId) => `${API}/movies/del/${movieId}`;   // DELETE
export const MOVIE_BY_SLUG_API = `${API}/movies/slug/movie`;  // GET -> /{slug}

// --- Favorites (Movies) ---
export const favoriteMovieApi = (movieId) => `${API}/favorites/movies/${movieId}`; // POST(add) / DELETE(remove)
export const FAVORITE_MOVIES_AUTH_API = `${API}/favorites/movies/auth`;           // GET (isteğe bağlı: kullanıcının favori listesi)

// -------------------- Images --------------------
// Admin list endpoint for paginated images
export const IMAGES_ADMIN_LIST_API = `${API}/images/admin`;
// Get image bytes by ID (public)
export const imageByIdApi = (imageId) => `${API}/images/${imageId}`;
// Upload image for a movie (requires ADMIN)
export const imageUploadForMovieApi = (movieId) => `${API}/images/${movieId}`;
// Update image by ID (requires ADMIN)
export const imageUpdateApi = (imageId) => `${API}/images/${imageId}`;
// Delete image by ID (requires ADMIN)
export const imageDeleteApi = (imageId) => `${API}/images/${imageId}`;
// Get all images for a movie (public)
export const movieImagesApi = (movieId) => `${API}/movies/${movieId}/images`;
// Get poster image ID for a movie (public)
export const moviePosterIdApi = (movieId) => `${API}/movies/${movieId}/poster`;
// Get single image details (fallback to basic endpoint)
export const imageDetailsApi = (imageId) => `${API}/images/${imageId}`;

// -------------------- Show Times --------------------
export const SHOWTIME_CREATE_API = `${API}/show-times`;           // POST
export const SHOWTIMES_LIST_API  = `${API}/show-times`;  
export const showTimeByIdApi = (id) => `${API}/show-times/${id}`; // GET/PUT/DELETE
export const SHOWTIME_UNAVAILABLE_SEATS_API = `${API}/show-times/unavailable-seats`; // GET
export const showTimesByMovieIdApi = (movieId) => `${API}/show-times/movie/${movieId}`;   // GET
export const showTimesByCinemaIdApi = (cinemaId) => `${API}/show-times/cinema/${cinemaId}`; // GET
export const SHOWTIMES_CITIES_WITH_API    = `${API}/show-times/cities-with-showtimes`;
export const SHOWTIMES_COUNTRIES_WITH_API = `${API}/show-times/countries-with-showtimes`;
export const showTimesByCinemaIdFlatApi = (id) => `${API}/show-times/cinema/${id}/flat`;
 



// -------------------- Tickets --------------------
export const TICKET_RESERVE_API = `${API}/tickets/reserve`;                // POST
export const TICKET_BUY_API = `${API}/tickets/buy-ticket`;                 // POST
export const TICKETS_AUTH_PASSED_API = `${API}/tickets/auth/passed-tickets`;   // GET
export const TICKETS_AUTH_CURRENT_API = `${API}/tickets/auth/current-tickets`; // GET


// -------------------- Countries --------------------

export const COUNTRY_LIST_API = `${API}/countries`; // GET
export const COUNTRY_ADD_API = `${API}/countries/add`; // POST
export const COUNTRY_DELETE_API = (countryId) => `${API}/countries/delete/${countryId}`; // DELETE
export const COUNTRY_EDIT_API = (countryId) => `${API}/countries/update/${countryId}`; // PUT

// -------------------- Cities --------------------
export const CITY_LIST_API = `${API}/cities`; // GET (basic list)
export const CITY_LIST_ALL_API = `${API}/cities/listAllCities`; // GET (with countryMiniResponse)
export const CITY_ADD_API = `${API}/cities`; // POST { name, countryId }
export const cityUpdateApi = (cityId) => `${API}/cities/${cityId}`; // PUT { name, countryId }
export const cityDeleteApi = (cityId) => `${API}/cities/${cityId}`; // DELETE
export const CITY_WITH_ITS_DISTRICT = (cityId) =>
  `${API}/cities/listCityWithItsDistrict/${cityId}`;


// -------------------- Districts --------------------
export const DISTRICT_LIST_API = `${API}/districts`; // GET
export const DISTRICT_ADD_API = `${API}/districts`; // POST { name, cityId }
export const districtUpdateApi = (districtId) => `${API}/districts/${districtId}`; // PUT { name, cityId }
export const districtDeleteApi = (districtId) => `${API}/districts/${districtId}`; // DELETE

// -------------------- Payments --------------------
export const PAYMENT_LIST_API = `${API}/payment`;
export const DELETE_PAYMENT = (paymentId) => `${API}/payment/${paymentId}`; // DELETE