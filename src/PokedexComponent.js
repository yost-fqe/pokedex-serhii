import React, { useEffect, useState } from 'react';
import './Pokedex.css';

const Pokedex = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState(1);
  // new state initiation to keep track of the selected type
  const [type, setType] = useState('all');

  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${generation}/`);
        const data = await response.json();
        const pokemonSpecies = data.pokemon_species;

        const detailedPokemonPromises = pokemonSpecies.map(async (pokemon) => {
          const id = pokemon.url.split('/').filter(Boolean).pop();
          try {
            const pokemonDetailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemonDetailData = await pokemonDetailResponse.json();
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
            console.error(`Error fetching details for Pokémon with ID ${id}:`, error);
            return null;
          }
        });

        const detailedPokemonList = (await Promise.all(detailedPokemonPromises)).filter(Boolean);
        detailedPokemonList.sort((a, b) => a.id - b.id);
        setPokemonList(detailedPokemonList);
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [generation]);

  const handleGenerationChange = (event) => {
    setGeneration(Number(event.target.value));
  };

  // helper function to get the value from the dropdown and store it in a state variable
  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  // conditionally create a new list of pokemon based on the current state of 'type'
  const filteredPokemonList = type === 'all' ? pokemonList : pokemonList.filter(pokemon => pokemon.types.includes(type));

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="pokedex-container">
      <header className="pokedex-header">
        <h1 className="pokedex-title">Pokedex</h1>
        <div className="selectors">
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
          <div className="type-select">
            <label htmlFor="type-select">Select Type: </label>
            {/* new dropdown to select the type we want to filter by */}
            <select id="type-select" value={type} onChange={handleTypeChange}>
              <option value="all">All</option>
              {['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map((typeName) => (
                <option key={typeName} value={typeName}>{typeName}</option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <div className="pokemon-grid">
        {/* now we are mapping over the 'filteredPokemonList' instead of 'pokemonList' */}
        {filteredPokemonList.map((pokemon) => (
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
