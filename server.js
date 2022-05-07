'use strict';

const express = require("express");
const movie = require("./Movie_Data/data.json");
const app = express();
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const APIKEY = process.env.APIKEY;
function Movie(id,title,release_date,poster_path, overview) {
    this.id = id;
    this.release_date = release_date;
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;   
}
app.get('/', homePageHandler);
app.get('/favorite', favoritePageHandler);
app.get('/trending', trendingPageHandler);
app.get('/search', searchPageHandler);
app.use(errorHandler);
function homePageHandler(req, res) {
    let result = [];
    movie.data.forEach((value) => {
        let oneMovie = new Movie(value.id ||"N/A",value.title || "N/A", value.release_date ||"N/A", value.poster_path || "N/A", value.overview || "N/A");
        result.push(oneMovie);

    });
    return res.status(200).json(result);
}
function favoritePageHandler(req, res) {

    return res.status(200).send("Welcome to Favorite Page!!");
}

function trendingPageHandler(req, res) {
    let result = [];
    let response = axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let oneMovie = new Movie(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A");
                result.push(oneMovie);
            });
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        });
}
function searchPageHandler(req, res) {
    
    const search = req.query.Movie;
    let result = [];
    console.log(req);
    let response = axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}&page=2`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let oneMovie = new Movie(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A");
                result.push(oneMovie);
            });
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        });
}
app.listen(4000, () => {
    console.log("Test :)");
});
function errorHandler(error, req, res) {
    const err = {
        status: 404,
        message: error
    }
    return res.status(404).send(err);
}