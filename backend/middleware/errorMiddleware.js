const notFound = (req, res, next) => {
    const error = new Error(`not found ${req.orignalUrl}`);
    res.status(404);
    next(error)
}

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode
    let message = err.message

    if(err.name === 'CastError' && err.kind === 'ObjectId') {
        message = 'Resource not found';
        statusCode = 404;
    }

    if(statusCode === 500 || statusCode === 400) {
        //send mail
    }

    res.status(statusCode).json({
        message,
        stack: process.env.ENVIRONMENT === 'production' ? '' : err.stack
    })
}

export {notFound, errorHandler}