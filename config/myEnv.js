if(process.env.NODE_ENV == "dev") {
    module.exports = {
        "mongodURL":`mongodb://localhost/teamplestay`;
    }
} else if(process.env.NODE_ENV == "production") {
    module.exports = {
        "mongodURL":`mongodb://localhost/teamplestay`;
    }
}