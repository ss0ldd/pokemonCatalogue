const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

const fetchPokemonData = async (pokemonIdOrName) => {
    const url = `${BASE_URL}${pokemonIdOrName}/`;
    const response = await fetch(url);
    const result = await response.json();

    return extractPokemonInfo(result);
}

const extractPokemonInfo = (data) => {
    const id = data.id;
    const name = data.name;
    const weight = data.weight/10;
    const height = data.height/10;
    const ability = data.abilities.length > 0
        ? data.abilities[0].ability.name
        : 'No Ability';
    const imageUrl = data.sprites.other['official-artwork'].front_default;

    return {
        id,
        name,
        weight,
        height,
        ability,
        imageUrl,
    }
}

const loadFavourites = () => {
    return JSON.parse(localStorage.getItem('favourites')) || [];
};

const toggleFavourite = (id) => {
    let favourites = JSON.parse(localStorage.getItem('favourites')) || [];
    const index = favourites.indexOf(id);
    if (index > -1) {
        favourites.splice(index, 1);
    } else {
        favourites.push(id);
    }
    localStorage.setItem('favourites', JSON.stringify(favourites));
};

const isPokemonFavourite = (id) => {
    const favourites = JSON.parse(localStorage.getItem('favourites')) || [];
    return favourites.includes(id);
};

const modalWindow = (pokemon) => {
    const modalWindow = document.querySelector('.pokemon-modal');
    const closeButton = document.querySelector('.close-button');
    const pokemonName = document.querySelector('.modal-title');
    const pokemonImage = document.querySelector('.modal-image');
    const pokemonInfo = document.querySelector('.modal-description');
    const favouriteButton = document.querySelector('.favourite-button');

    modalWindow.style.display = "block";
    pokemonName.textContent = pokemon.name;
    pokemonImage.src = pokemon.imageUrl;
    pokemonInfo.innerHTML = `
            Number: ${pokemon.id}<br>
            Ability: ${pokemon.ability}<br>
            Weight: ${pokemon.weight} kg<br>
            Height: ${pokemon.height} m<br>
        `;

    const isFavourite = isPokemonFavourite(pokemon.id);
    favouriteButton.textContent = isFavourite ? 'Favourite' : 'Add to favourites';
    favouriteButton.dataset.pokemonId = pokemon.id;

    favouriteButton.addEventListener('click', () => {
        toggleFavourite(pokemon.id);
        const isFavourite = isPokemonFavourite(pokemon.id);
        favouriteButton.textContent = isFavourite ? 'Favourite' : 'Add to favourites';
    });

    closeButton.addEventListener('click', () => {
        modalWindow.style.display = "none";
    })

    window.addEventListener('click', (event) => {
        if (event.target == modalWindow) {
            modalWindow.style.display = "none";
        }
    })

}

const render = (activeImageIndex) => {
    const carouselItems = document.querySelectorAll('.carousel-item');

    carouselItems.forEach((item, index) => {
        if (activeImageIndex === index) item.classList.add('active');
        else item.classList.remove('active');
    })
};

const createPokemonCards = (pokemonArray) => {
    const pokemonContainer = document.querySelector(".pokemon-container");
    const favourites = loadFavourites();

    pokemonArray.forEach(pokemon => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card");

        const pokemonCardImage = document.createElement("img");
        pokemonCardImage.classList.add("pokemon-image");
        pokemonCardImage.src = pokemon.imageUrl;

        const pokemonCardName = document.createElement("p");
        pokemonCardName.classList.add("pokemon-name");
        pokemonCardName.textContent = pokemon.name;

        const favouriteIndicator = document.createElement("span");
        if (favourites.includes(pokemon.id)) {
            favouriteIndicator.textContent = "⭐";
        }

        pokemonCard.appendChild(pokemonCardImage);
        pokemonCard.appendChild(pokemonCardName);
        pokemonCard.appendChild(favouriteIndicator);
        pokemonContainer.appendChild(pokemonCard);

        pokemonCard.addEventListener("click", (e) => {
            modalWindow(pokemon);
        })
    })
}

const initDOM = (pokemonData) => {

    const carouselInner = document.querySelector('.carousel-inner');
    carouselInner.innerHTML = '';

    pokemonData.popularPokemons.forEach((pokemonObj, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');

        if (pokemonData.imageIndex === index) {
            carouselItem.classList.add('active');
        }

        const img = document.createElement('img');
        img.classList.add('d-block', 'w-50');
        img.src = pokemonObj.imageUrl;

        const info = document.createElement('div');
        info.classList.add('pokemon-info');

        const name = document.createElement('h1');
        name.classList.add('pokemon-name');
        name.textContent = pokemonObj.name;

        const id = document.createElement('p');
        id.textContent = `number: ${pokemonObj.id}`;

        const ability = document.createElement('p');
        ability.textContent = `ability: ${pokemonObj.ability}`;

        const weightInfo = document.createElement('p');
        weightInfo.textContent = `weight: ${pokemonObj.weight}kg`;

        const heightInfo = document.createElement('p');
        heightInfo.textContent = `height: ${pokemonObj.height}m`;

        info.appendChild(name);
        info.appendChild(id);
        info.appendChild(ability);
        info.appendChild(weightInfo);
        info.appendChild(heightInfo)

        carouselItem.appendChild(img);
        carouselItem.appendChild(info);

        carouselInner.appendChild(carouselItem);
    })
};

const pokemonCarousel = (pokemonData) => {

    const buttonNext = document.querySelector(".carousel-control-next");
    const buttonPrevious = document.querySelector(".carousel-control-prev");

    buttonNext.addEventListener("click", (e) => {
        pokemonData.imageIndex = (pokemonData.imageIndex + 1) % pokemonData.popularPokemons.length;
        render(pokemonData.imageIndex);
    })

    buttonPrevious.addEventListener("click", (e) => {
        pokemonData.imageIndex = (pokemonData.imageIndex - 1 + pokemonData.popularPokemons.length) % pokemonData.popularPokemons.length;
        render(pokemonData.imageIndex);
    })
}

const searchPokemons = () =>{
    const searchBar = document.querySelector(".search-bar");

    while (searchBar.firstChild) {
        searchBar.removeChild(searchBar.firstChild);
    }

    const inputElement = document.createElement("input");
    inputElement.classList.add("form-control");
    inputElement.placeholder = "Search by number or name...";

    const searchButton = document.createElement("button");
    searchButton.classList.add("search-button");
    searchButton.textContent = "Find";

    searchButton.addEventListener("click", async () => {
        try {
            const query = inputElement.value.trim().toLowerCase();
            const foundData = await fetchPokemonData(query);

            if (foundData && foundData.name) {
                modalWindow(foundData);
            } else {
                alert('No Pokemon found with this name or ID.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('An error occurred while fetching the data.');
        }
    });

    searchBar.appendChild(inputElement);
    searchBar.appendChild(searchButton);
}


const pokemonCatalogue = async () => {

    let pokemonIds = [];
    for (let i = 1; i <= 40; i++){
        pokemonIds.push(i);
    }

    const popularPokemons = ['charizard', 'pikachu', 'eevee', 'bulbasaur', 'sylveon'];

    const containerPromises = pokemonIds.map(id => fetchPokemonData(id));
    const carouselPromises = popularPokemons.map(pokemon => fetchPokemonData(pokemon));

    try{
        const pokemonContainer = await Promise.all(containerPromises);
        const pokemonPopularCarousel = await Promise.all(carouselPromises);

        const state = {
            popularPokemons: pokemonPopularCarousel,
            imageIndex: 1,
        }
        searchPokemons();

        pokemonCarousel(state);
        initDOM(state);

        createPokemonCards(pokemonContainer);
    } catch (error) {
        console.log(error.message);
    }
}

pokemonCatalogue();