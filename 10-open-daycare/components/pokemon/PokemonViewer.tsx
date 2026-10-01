'use client';

import { useState, useEffect } from 'react';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
}

export default function PokemonViewer() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState(1);

  const fetchPokemon = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) throw new Error('Pokemon not found');
      const data = await res.json();
      setPokemon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon(currentId);
  }, [currentId]);

  const goPrevious = () => {
    if (currentId > 1) setCurrentId(currentId - 1);
  };

  const goNext = () => {
    setCurrentId(currentId + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading Pokemon...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-lg">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchPokemon(currentId)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!pokemon) return null;

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold capitalize mb-4">
        #{pokemon.id} - {pokemon.name}
      </h2>

      <img
        src={pokemon.sprites.other['official-artwork'].front_default}
        alt={pokemon.name}
        className="w-48 h-48 object-contain"
      />

      <div className="flex gap-2 mt-4">
        {pokemon.types.map(({ type }) => (
          <span
            key={type.name}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm capitalize"
          >
            {type.name}
          </span>
        ))}
      </div>

      <div className="mt-4 text-center text-gray-600">
        <p>Height: {pokemon.height / 10} m</p>
        <p>Weight: {pokemon.weight / 10} kg</p>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={goPrevious}
          disabled={currentId <= 1}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={goNext}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
