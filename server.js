'use strict';
//console.log("test");

const express = require("express");
const movie = require("./Movie_Data/data.json");
const app = express();
const axios = require("axios");
const dotenv = require("dotenv");
const pg = require("pg");
dotenv.config();
const APIKEY = process.env.APIKEY;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new pg.Client(DATABASE_URL);
function Movie(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.release_date = release_date;
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}
app.use(express.json());
app.get('/', homePageHandler);
app.get('/favorite', favoritePageHandler);
app.get('/trending', trendingPageHandler);
app.get('/search', searchPageHandler);
app.post('/addMovie', addMovieHandler);
app.get('/getMovies', getMoviesHandler);
app.put('/UPDATE/:id', updateHandler);
app.delete('/DELETE/:id', deleteHandler);
app.get('/getMovie/:id', getMovieByIdHandler);

app.get("*", notFoundHandler);

app.use(errorHandler);

// homepage function
function homePageHandler(req, res) {
    let result = [];
    movie.data.forEach((value) => {
        let oneMovie = new Movie(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A");
        result.push(oneMovie);

    });
    return res.status(200).json(result);
}
// favorite function 
function favoritePageHandler(req, res) {

    return res.status(200).send("Welcome to Favorite Page!!");
}

// trending function
function trendingPageHandler(req, res) {
    let result = [];
    let response = axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                // let oneMovie = new Movie(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A");
                result.push(oneMovie);
            });
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        });
}

// Search Function
function searchPageHandler(req, res) {
    //This is PostMan link to query http://localhost:4000/search?Movie=Lord
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
/* insert this into client "PostMan"
{
        "release_date": "2013-10-25",
        "title": "Lord of Tears",
        "poster_path": "/y0T9pC62bLTOudEVXrxcjJTjrSw.jpg",
        "overview": "Lord of Tears tells the story of James Findlay, a school teacher plagued by recurring nightmares of a mysterious and unsettling entity. Suspecting that his visions are linked to a dark incident in his past, James returns to his childhood home, a notorious mansion in the Scottish Highlands, where he uncovers the disturbing truth behind his dreams, and must fight to survive the brutal consequences of his curiosity.",
        "myComment": "This is amazing Film"
    }
*/
function addMovieHandler(req, res) {
    const movieV = req.body;
    const sql = `INSERT INTO addMovie(release_date,title,poster_path,overview,my_comment) VALUES($1,$2,$3,$4,$5) RETURNING *;`;
    //console.log(req.body);
    const values = [movieV.release_date, movieV.title, movieV.poster_path, movieV.overview, movieV.my_comment];
    client.query(sql, values).then((result) => {
        res.status(201).json(result.rows);
    }).catch(error => {
        errorHandler(error, req, res);
    });
};

//getMovies function

function getMoviesHandler(req, res) {
    const sql = `SELECT * FROM addMovie;`;
    client.query(sql).then((result) => {
        res.status(201).json(result.rows);
    }).catch(error => {
        errorHandler(error, req, res);
    });
}

//update function
/* Use this into your Client 
http://localhost:4000/UPDATE/10
{
        "my_comment": "Best movie ever 'This is update sql commant'"
    }
*/
function updateHandler(req, res) {
    const id = req.params.id;
    const movieUpdate = req.body;

    const sql = `UPDATE addMovie SET my_comment=$1 WHERE id=$2 RETURNING *;`;
    const values = [movieUpdate.my_comment, id];

    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    })
}

//delete Function
//http://localhost:4000/DELETE/10
function deleteHandler(req, res) {
    const id = req.params.id;
    const movieDel = req.body;

    const sql = `DELETE FROM addMovie WHERE id=$1 ;`;
    const value = [id];

    client.query(sql, value)
        .then((result) => {
            return res.status(204).json({});
        }).catch((error) => {
            errorHandler(error, req, res);
        })
}

//get Movie By Id function
//http://localhost:4000/getMovie/5
function getMovieByIdHandler(req, res) {
    const id = req.params.id;

    const sql = `SELECT * FROM addMovie WHERE id=$1 ;`;
    const value = [id];

    client.query(sql, value)
        .then((result) => {
            return res.status(200).json(result.rows);
        }).catch((error) => {
            errorHandler(error, req, res);
        })

}


//Connect to DB
client.connect()
    .then(() => {
        app.listen(4000, () => {
            console.log("Test :)");
        });
    }).catch(error => {
        errorHandler(error, req, res);
    })


//Error Functions
function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    return res.status(500).send(err);
}
function notFoundHandler(req, res) {
    return res.status(404).send("Not Found :404");

}