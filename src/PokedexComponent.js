import React, { useEffect, useState } from 'react';
import './Pokedex.css';

const Pokedex = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState(1);

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
