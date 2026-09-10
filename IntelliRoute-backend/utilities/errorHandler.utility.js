class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = ErrorHandler;

//! 🔬 Line-by-Line Breakdown
//* class ErrorHandler extends Error {
//? You're creating a new class called ErrorHandler.
//? It inherits from the built-in Error class.
//? This means ErrorHandler can be used like a normal error (it has .message, .stack, etc.), but we can customize it.

//* constructor(message, statusCode) {
//? This constructor takes in:
//? message: What went wrong (e.g. "User not found")
//? statusCode: HTTP status code (e.g. 404, 500)

//* super(message);
//? Calls the constructor of the parent class (Error).
//? This sets this.message = message and initializes the error.

//* this.statusCode = statusCode;
//? Adds a new property statusCode to the error object.
//? Now, unlike a regular Error, this one includes a status code for the response.

//* Error.captureStackTrace(this, this.constructor);
//? This is a built-in V8 (Chrome engine) method.
//? It captures the current stack trace excluding the constructor function, so the trace is cleaner when you debug.
//? Useful for better debugging/logging in development.
