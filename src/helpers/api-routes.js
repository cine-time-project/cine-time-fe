// src/helpers/api-routes.js
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

// -------------------- Contact Messages --------------------
export const CONTACT_CREATE_API = `${API}/contactmessages`; // POST

// -------------------- Cities --------------------
export const CITY_LIST_API = `${API}/cities`; // GET

// -------------------- Cinemas --------------------
export const CINEMA_LIST_API = `${API}/cinemas`;            // GET
export const CINEMA_CREATE_API = `${API}/cinemas`;          // POST
export const cinemaByIdApi = (id) => `${API}/cinemas/${id}`;           // GET/PUT/DELETE
export const CINEMA_SPECIAL_HALLS_API = `${API}/special-halls`;        // GET
export const CINEMA_FAVORITES_AUTH_API = `${API}/favorites/auth`;      // GET
export const cinemaHallsApi = (id) => `${API}/cinemas/${id}/halls`;    // GET

// -------------------- Halls --------------------
export const HALL_LIST_API = `${API}/hall`;     // GET
export const HALL_CREATE_API = `${API}/hall`;   // POST
export const hallByIdApi = (hallId) => `${API}/hall/${hallId}`; // GET/PUT/DELETE

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

// -------------------- Images --------------------
export const imageByIdApi = (imageId) => `${API}/images/${imageId}`; // GET/PUT/DELETE
export const imageUploadForMovieApi = (movieId) => `${API}/images/${movieId}`; // POST

// -------------------- Show Times --------------------
export const SHOWTIME_CREATE_API = `${API}/show-times`;           // POST
export const showTimeByIdApi = (id) => `${API}/show-times/${id}`; // GET/PUT/DELETE
export const SHOWTIME_UNAVAILABLE_SEATS_API = `${API}/show-times/unavailable-seats`; // GET
export const showTimesByMovieIdApi = (movieId) => `${API}/show-times/movie/${movieId}`;   // GET
export const showTimesByCinemaIdApi = (cinemaId) => `${API}/show-times/cinema/${cinemaId}`; // GET

// -------------------- Tickets --------------------
export const TICKET_RESERVE_API = `${API}/tickets/reserve`;                // POST
export const TICKET_BUY_API = `${API}/tickets/buy-ticket`;                 // POST
export const TICKETS_AUTH_PASSED_API = `${API}/tickets/auth/passed-tickets`;   // GET
export const TICKETS_AUTH_CURRENT_API = `${API}/tickets/auth/current-tickets`; // GET
