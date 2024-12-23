export const HTTP_CODES  = {
    SUCCESS :  200,
    CREATED : 201,
    ALREADY_FOUND : 403,
    NOT_FOUND : 404,
    UNAUTHORIZED  : 401,
    SERVER_ERROR : 500,
    TEMP_REDIRECT  : 307,
    PERM_REDIRECT  : 308,
    BAD_REQUEST  : 400,
    GONE : 410 , // Requested Url has been Removed 
    FORBIDDEN  : 403,
    UNAVALIABLE : 503, 
} 

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 5*1024*1024; 