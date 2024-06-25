// import libraries and styling sheets
import React, { useEffect, useState } from 'react';
import './Pokedex.css';

// define component
const Pokedex = () => {
  // define state
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState(1);

  // useEffect to fetch data
  // notice that we now have something in the dependancy array at the end. that is because we want everything in this function 
  // to trigger(fetch new data) when the value stored in the 'generation' state changes.
  useEffect(() => {
    const fetchPokemon = async () => {
      // set loading to true while data fetching is in progress
      setLoading(true);
      // function to fetch names and url endpoints for individual pokemon within each generation
      try {
        // make the call to the api and format the response to json (it likely already is in json but in the odd case that it isn't json is easy to work with for getting to nested objects)
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${generation}/`);
        const data = await response.json();
        // define a variable for the specific nested property we are looking for (name + url)
        const pokemonSpecies = data.pokemon_species;

        // loop over the returned response from the initial call to get the detailed data for each pokemon
        const detailedPokemonPromises = pokemonSpecies.map(async (pokemon) => { // what is in (pokemon) can be called whatever you want it to be. for clarity I named it pokemon, but 'index' is common.
          // this grabs the id from the end of the url string
          const id = pokemon.url.split('/').filter(Boolean).pop();
          try {
            // use the id we just grabed from the returned initial call to get the appropriate details
            const pokemonDetailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemonDetailData = await pokemonDetailResponse.json();
            // define the data structure that I want to display to the user with the values from the second api call. 
            // notice .map() appearing again when certain properties are arrays of values instead of single values
            return {
              id: pokemonDetailData.id,
              name: pokemonDetailData.name,
              height: pokemonDetailData.height,
              weight: pokemonDetailData.weight,
              abilities: pokemonDetailData.abilities.map(ability => ability.ability.name),
              types: pokemonDetailData.types.map(type => type.type.name),
              stats: pokemonDetailData.stats.map(stat => ({
                name: stat.stat.name,
                base_stat: stat.base_stat,
              })),
              image: pokemonDetailData.sprites.front_default,
            };
          } catch (error) {
            // if the second call failed, let the user know specifically which id the call failed for. 
            console.error(`Error fetching details for Pokémon with ID ${id}:`, error);
            return null;
          }
        });

        // after we have looped through the entire first array and made api calls respecively for each index we create a new list that only returns succesfully returned data
        // if for some reason pokemon decided to change a pokemon id tomorrow we would only get a console error instead of the entire application breaking. 
        const detailedPokemonList = (await Promise.all(detailedPokemonPromises)).filter(Boolean);
        // sort this list by id number instead of alphebetically (id is the default sort in the actual games)
        detailedPokemonList.sort((a, b) => a.id - b.id);
        // update the state so we can use it in our render method (remember 'detailedPokemonList is only defined in the scopr of this useEffect function and will not exist outside of it)
        setPokemonList(detailedPokemonList);
      } catch (error) {
        // throw an error if something went wrong in the initial api call
        console.error("Error fetching Pokémon:", error);
      } finally {
        // all good? sweet we're no longer loading. 
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [generation]); // every time the 'generation' state changes this function should be called. 

  // helper function to grab the value from the dropdown element and use it to set the state.
  const handleGenerationChange = (event) => {
    setGeneration(Number(event.target.value));
  };

  // if loading state is true, we return something other than a blank screen.
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // if loading state is false, we return what we intended the user to see.
  return (
    <div className="pokedex-container">
      <header className="pokedex-header">
        <h1 className="pokedex-title">Pokedex</h1>
        <div className="generation-select">
          <label htmlFor="generation-select">Select Generation: </label>
          <select id="generation-select" value={generation} onChange={handleGenerationChange}>
            <option value="1">Generation 1</option>
            <option value="2">Generation 2</option>
            <option value="3">Generation 3</option>
            <option value="4">Generation 4</option>
            <option value="5">Generation 5</option>
            <option value="6">Generation 6</option>
            <option value="7">Generation 7</option>
            <option value="8">Generation 8</option>
          </select>
        </div>
      </header>
      <div className="pokemon-grid">
        {pokemonList.map((pokemon) => (
          <div key={pokemon.id} className="pokemon-card">
            <img src={pokemon.image} alt={pokemon.name} className="pokemon-image" />
            <div className="pokemon-info">
              <h2>{pokemon.name} (ID: {pokemon.id})</h2>
              <p>Height: {pokemon.height} decimetres</p>
              <p>Weight: {pokemon.weight} hectograms</p>
              <p>Abilities: {pokemon.abilities.join(', ')}</p>
              <p>Types: {pokemon.types.join(', ')}</p>
              <div>
                Base Stats:
                <ul>
                  {pokemon.stats.map(stat => (
                    <li key={stat.name}>{stat.name}: {stat.base_stat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pokedex;
