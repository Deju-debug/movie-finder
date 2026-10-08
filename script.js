const movieSearchForm = document.getElementById("movie-search-form");
const movieSearchInput = document.getElementById("movie-search-input");
const movieContainer = document.getElementById("movie-container");
const movieDetailsModal = document.getElementById("movie-details-modal");
const closeDetailsButton = document.getElementById("close-details-button");
const watchlistContainer = document.getElementById("watchlist-container");
const watchlistCount = document.getElementById("watchlist-count");
const watchlistEmptyMessage = document.getElementById("watchlist-empty-message");
const navWatchlistCount = document.getElementById("nav-watchlist-count");
const detailsWatchlistButton = document.getElementById("details-watchlist-button");
let currentMovieDetails = null;
let watchlistArray = [];




const genreMap = {
                28: "Action",
                12: "Adventure",
                16: "Animation",
                35: "Comedy",
                80: "Crime",
                99: "Documentary",
                18: "Drama",
                10751: "Family",
                14: "Fantasy",
                36: "History",
                27: "Horror",
                10402: "Music",
                9648: "Mystery",
                10749: "Romance",
                878: "Science Fiction",
                10770: "TV Movie",
                53: "Thriller",
                10752: "War",
                37: "Western"
            };

function createMovieCard(movie){

    const movieCard = document.createElement("article");
    movieCard.classList.add("movie-card");

    const posterWrap = document.createElement("div");
    posterWrap.classList.add("movie-poster-wrap");
    movieCard.append(posterWrap);

    const moviePoster = document.createElement("img");
    moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    moviePoster.alt = `${movie.title} poster`;
    moviePoster.classList.add("movie-poster");
    posterWrap.append(moviePoster);

    const movieRating = document.createElement("span");
    movieRating.classList.add("movie-rating");
    movieRating.textContent = movie.vote_average;
    posterWrap.append(movieRating);

    const cardContent = document.createElement("div");
    cardContent.classList.add("movie-card-content");
    movieCard.append(cardContent);

    const movieMeta  = document.createElement("p");
    movieMeta.classList.add("movie-meta");
    cardContent.append(movieMeta);

    
    const releaseYear = document.createElement("span");
    releaseYear.textContent = movie.release_date.split("-")[0];
    releaseYear.classList.add("movie-year");
    movieMeta.append(releaseYear);

    const metaDot = document.createElement("span");
    metaDot.classList.add("meta-dot");
    movieMeta.append(metaDot);

    
    let genreText;

    if (movie.genre_ids) {
        const genres = movie.genre_ids.map(id => genreMap[id]);
        genreText = genres.join(", ");
    } else {
        const genres = movie.genres.map(function(genre) {
            return genre.name;
        });
        genreText = genres.join(", ");
    }

    const genre = document.createElement("span");
    genre.classList.add("movie-genre");
    genre.textContent = genreText;
    movieMeta.append(genre);

    const movieTitle = document.createElement("h3");
    movieTitle.classList.add("movie-title");
    movieTitle.textContent = movie.title;
    cardContent.append(movieTitle);

    const movieActions = document.createElement("div");
    movieActions.classList.add("movie-card-actions");
    cardContent.append(movieActions);


    return movieCard;

}



/* close button to close the movie details */

    closeDetailsButton.addEventListener("click", function(){
        movieDetailsModal.hidden = true;
    })

    const modalBackdrop = movieDetailsModal.querySelector(".modal-backdrop");

    modalBackdrop.addEventListener("click", function(){
        movieDetailsModal.hidden = true;
    });

    document.addEventListener("keydown", function(event){
    if(event.key === "Escape"){
        movieDetailsModal.hidden = true;
    }
    });

    movieSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const movieSearchInputValue = movieSearchInput.value.trim()

    if(movieSearchInputValue === ""){
        console.log("please enter a vaild value")
        return;
    }

    movieSearchInput.value = "";
    findMovie(movieSearchInputValue);
    

    
    
})

async function findMovie(searchTerm) {
            try{

                movieContainer.innerHTML = "Loading please wait..."


                const encodedSearch = encodeURIComponent(searchTerm);
                const apiUrl = `https://api.themoviedb.org/3/search/movie?query=${encodedSearch}`;
                const response = await fetch(apiUrl, {
               headers:{
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNThkZWEyMWM4Nzc1OWZiMDdmZjc4ODNiMWNjMGQ4NiIsIm5iZiI6MTc5MDY4MzQ0My45MzI5OTk4LCJzdWIiOiI2YWJiYTkzMzYzZDI4ZjdlYzdiNjExNjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.lUK3sCYz8SjQZm9abl1dxMi69Z53ts-ealWpmihEhmo`,
                'Content-Type':'application/json'
               }
            });

            if(!response.ok){
                throw new Error(`http error ${response.status}`);
            }

            const data = await response.json();

            movieContainer.innerHTML = "";
            if (data.results.length === 0) {
            movieContainer.textContent = "No movies found.";
            return;

            }



            data.results.forEach(movie => {

            const card = createMovieCard(movie);
            movieContainer.append(card);

            const movieActions = card.querySelector(".movie-card-actions");

            /* Movie details button */
            const viewDetailsButton = document.createElement("button");
            viewDetailsButton.type = "button";
            viewDetailsButton.classList.add(
                "button",
                "button-small",
                "view-details-button"
            );
            viewDetailsButton.textContent = "View details";
            viewDetailsButton.dataset.movieId = movie.id;

            movieActions.append(viewDetailsButton);

            viewDetailsButton.addEventListener("click", function(){
                const movieId = viewDetailsButton.dataset.movieId;
                ViewDetailsButton(movieId);

            });


            /* Watchlist button */
            const watchlistButton = document.createElement("button");
            watchlistButton.type = "button";
            watchlistButton.classList.add("text-button", "add-watchlist-button");

            watchlistButton.dataset.movieId = movie.id;

            const movieAlreadyExists = watchlistArray.some(function(watchlistMovie) {
                return watchlistMovie.id === movie.id;
            });

            if (movieAlreadyExists) {
                watchlistButton.textContent = "✓ In Watchlist";
            } else {
                watchlistButton.textContent = "+ Watchlist";
            }

            movieActions.append(watchlistButton);

            watchlistButton.addEventListener("click", function() {

                const movieAlreadyExists = watchlistArray.some(function(watchlistMovie) {
                    return watchlistMovie.id === movie.id;
                });

                if (!movieAlreadyExists) {
                    watchlistArray.push(movie);
                    renderWatchlist();

                    watchlistButton.textContent = "✓ In Watchlist";
                    watchlistButton.disabled = true;

                }

            });

        });
            }
            

            
        
           
           catch(error){
                console.log(error);
                movieContainer.textContent = "Something went wrong. Please try again.";
            }
            }

function updateWatchlistButtons(movieId) {
    const searchWatchlistButtons = document.querySelectorAll(
        `.add-watchlist-button[data-movie-id="${movieId}"]`
    );

    searchWatchlistButtons.forEach(function(button) {
        button.textContent = "+ Watchlist";
    });

    if (currentMovieDetails && currentMovieDetails.id === movieId) {
        detailsWatchlistButton.textContent = "+ Add to watchlist";
        detailsWatchlistButton.disabled = false;
    }
}

function renderWatchlist(){
    watchlistContainer.innerHTML = "";
    if(watchlistArray.length === 1){
        watchlistCount.textContent = `${watchlistArray.length} film`
        }else{
            watchlistCount.textContent = `${watchlistArray.length} films`
        }

        navWatchlistCount.textContent = watchlistArray.length;
        navWatchlistCount.setAttribute(
            "aria-label",
            `${watchlistArray.length} saved movies`
        );

        if(watchlistArray.length >= 1){
            watchlistEmptyMessage.hidden = true;
        }else{
            watchlistEmptyMessage.hidden = false;
        }

        watchlistArray.forEach(movie =>{

        const card = (createMovieCard(movie));
        watchlistContainer.append(card);

        const movieActions = card.querySelector(".movie-card-actions");


        const removeWatchlist = document.createElement("button");
        removeWatchlist.textContent = "remove";
        movieActions.append(removeWatchlist);

        removeWatchlist.addEventListener("click", function(){

        watchlistArray = watchlistArray.filter(function(watchlistMovie) {
            return watchlistMovie.id !== movie.id;
        });

        updateWatchlistButtons(movie.id);

        renderWatchlist();

        });

        })   
    }


async function ViewDetailsButton(movieId) {
    try{

        movieDetailsModal.querySelector("#details-title").textContent = "Loading...";
        movieDetailsModal.hidden = false;

        const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}`;

        const response = await fetch(detailsUrl, {
            headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNThkZWEyMWM4Nzc1OWZiMDdmZjc4ODNiMWNjMGQ4NiIsIm5iZiI6MTc5MDY4MzQ0My45MzI5OTk4LCJzdWIiOiI2YWJiYTkzMzYzZDI4ZjdlYzdiNjExNjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.lUK3sCYz8SjQZm9abl1dxMi69Z53ts-ealWpmihEhmo`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`http error ${response.status}`);
        }

        const movieDetails = await response.json();

        currentMovieDetails = movieDetails;

        movieDetailsModal.querySelector("#details-title").textContent = movieDetails.title;
        movieDetailsModal.querySelector("#details-release-date").textContent = movieDetails.release_date;
        movieDetailsModal.querySelector("#details-rating").textContent = movieDetails.vote_average;
        movieDetailsModal.querySelector("#details-runtime").textContent = `${movieDetails.runtime} minutes`;
        movieDetailsModal.querySelector("#details-poster").src = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;

        const movieDetailGenre = movieDetails.genres.map(function(genre) {
            return genre.name;
        });

        const movieDetailText = movieDetailGenre.join(", ");
        movieDetailsModal.querySelector("#details-genres").textContent = movieDetailText;

        movieDetailsModal.querySelector("#details-overview").textContent = movieDetails.overview;

        // Check if this movie is already in the watchlist
        const movieAlreadyExists = watchlistArray.some(function(movie) {
            return movie.id === currentMovieDetails.id;
        });

        if (movieAlreadyExists) {
            detailsWatchlistButton.textContent = "✓ In Watchlist";
            detailsWatchlistButton.disabled = true;
        } else {
            detailsWatchlistButton.textContent = "+ Add to watchlist";
            detailsWatchlistButton.disabled = false;
        }

        movieDetailsModal.hidden = false;
    }catch(error){
        console.log(error);
        movieDetailsModal.hidden = true;
    }
    
}


detailsWatchlistButton.addEventListener("click", function(){

    const movieAlreadyExists = watchlistArray.some(function(movie){
        return movie.id === currentMovieDetails.id;
    });

    if(!movieAlreadyExists){
        watchlistArray.push(currentMovieDetails);
        renderWatchlist();

        detailsWatchlistButton.textContent = "✓ In Watchlist";
        detailsWatchlistButton.disabled = true;
    }

});
 
