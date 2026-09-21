---
name: pokemon
description: Consulta información de Pokémon en la PokéAPI. Usar cuando el usuario mencione Pokémon (por nombre o ID/número de la Pokédex), o pregunte sobre sus stats, tipos, habilidades, movimientos, sprites, altura, peso, generación, hábitat o descripción. Cualquier tema de conversación sobre un Pokémon específico debe consultar esta API para responder.
---

# Pokémon — Consulta a la PokéAPI

Cuando el usuario pregunte cualquier cosa sobre un Pokémon específico, consulta la PokéAPI **antes** de responder. Nunca respondas de memoria: los datos deben venir de la API.

## Cómo consultar

Endpoint principal (acepta nombre o ID de la Pokédex):

```
https://pokeapi.co/api/v2/pokemon/{nombre-o-id}
```

Ejemplos:

- `https://pokeapi.co/api/v2/pokemon/ditto`
- `https://pokeapi.co/api/v2/pokemon/1` (bulbasaur)

Usa la herramienta `webfetch` para hacer la consulta.

## Normalización del nombre o ID

- Nombres siempre en **minúsculas**.
- Espacios y puntos se reemplazan por guiones: `Mr. Mime` → `mr-mime`, `Ho-Oh` → `ho-oh`.
- Si el usuario da un **número**, úsalo directamente como ID.
- Si el usuario da el nombre en español (ej. "Bulbasaur" es igual, pero "Pikachu" vs formas regionales), intenta primero el nombre en inglés/minúsculas; si falla con 404, prueba variantes con guiones.

## Manejo de errores

- **404**: el Pokémon no existe o el nombre está mal escrito. Informa al usuario que no se encontró y sugiere verificar el nombre o el ID.
- Si la API no responde, dilo al usuario en lugar de inventar datos.

## Campos relevantes de la respuesta

La respuesta es muy grande (~50 KB). **No la cites completa**: extrae solo lo relevante para la pregunta.

| Campo | Uso |
| --- | --- |
| `id`, `name` | Identidad del Pokémon |
| `types[].type.name` | Tipos (orden por `slot`) |
| `abilities[].ability.name` | Habilidades; marca las ocultas (`is_hidden: true`) |
| `stats[].base_stat` | Stats base: hp, attack, defense, special-attack, special-defense, speed |
| `height` | Altura en **decímetros** → divide entre 10 para metros |
| `weight` | Peso en **hectogramos** → divide entre 10 para kilogramos |
| `base_experience` | Experiencia base |
| `sprites.other.official-artwork.front_default` | Imagen oficial (la mejor para mostrar) |
| `sprites.front_default` | Sprite clásico |
| `moves[].move.name` | Movimientos (lista larga; resume o filtra según la pregunta) |
| `game_indices[].version.name` | Juegos donde aparece |
| `held_items[].item.name` | Objetos que puede llevar |
| `species.url` | URL para datos adicionales (ver abajo) |

## Datos adicionales (species)

Para descripción, generación, hábitat o evolución, consulta la URL que viene en `species.url` de la respuesta principal:

```
https://pokeapi.co/api/v2/pokemon-species/{id}
```

Campos útiles de species:

- `flavor_text_entries[]`: descripciones (busca la entrada en `language.name: "es"` o `"en"` según el idioma del usuario; usa `version` más reciente si hay varias).
- `generation.name`: generación donde debutó.
- `habitat.name`, `color.name`: hábitat y color.
- `evolution_chain.url`: cadena evolutiva (consulta solo si el usuario pregunta por evoluciones).
- `is_legendary`, `is_mythical`: legendario o mítico.

## Cómo responder

1. Consulta el endpoint principal siempre.
2. Consulta `species` solo si la pregunta lo requiere (descripción, generación, hábitat, evolución).
3. Responde con los campos que sean relevantes a la pregunta concreta, citando que los datos vienen de la PokéAPI.
4. Presenta las unidades convertidas (m/kg), las habilidades ocultas marcadas como tales y los stats con sus nombres.
