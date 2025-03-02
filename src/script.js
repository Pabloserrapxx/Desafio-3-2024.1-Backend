// Função para mudar a imagem
function changeImage(id, url) {
    document.getElementById(id).src = url;
}

// Função para mudar o texto
function changeText(id, text) {
    document.getElementById(id).innerText = text;
}

let pokemons = [];
let Index = 0;

async function ppokemons() {
    try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1229");
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        pokemons = data.results;
        display_do_Pokemon(Index);
    } catch (error) {
        console.error('Erro ao buscar Pokémons:', error);
        changeText('name', 'Erro ao carregar Pokémons.');
         changeImage('img_sprite_front_default', Imagem_caso_não_tenha);
    }
}

const pokemonCache = {};
const Imagem_caso_não_tenha = 'R.png'; 
async function display_do_Pokemon(index) {
    if (!pokemons.length) return;

    const nomePokemon = pokemons[index].name;

    if (pokemonCache[nomePokemon]) {
        AltualizarPokemonUI(pokemonCache[nomePokemon]);
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon}`);
        if (!response.ok) {
             const error = new Error(`Erro ao buscar o Pokémon: ${nomePokemon}`);
            error.status = response.status; 
            throw error;
        }
        const pokemonData = await response.json();
        pokemonCache[nomePokemon] = pokemonData;
        AltualizarPokemonUI(pokemonData);
    } catch (error) {
        console.error(error);
        changeText('name', `Erro ao carregar ${nomePokemon}`);
        changeImage('img_sprite_front_default', Imagem_caso_não_tenha); 

        if (error.status === 404) {  
            console.warn(`Pokémon não encontrado: ${nomePokemon}`);
        }
    }
}

async function AltualizarPokemonUI(pokemonData) {
    changeText('name', pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1));


     if (pokemonData.sprites && pokemonData.sprites.front_default) {
        changeImage('img_sprite_front_default', pokemonData.sprites.front_default);
    } else {
        changeImage('img_sprite_front_default', Imagem_caso_não_tenha);
    }

    changeText('height', `${(pokemonData.height / 10).toFixed(1)} m`);
    changeText('weight', `${(pokemonData.weight / 10).toFixed(1)} kg`);

    try {
        const speciesResponse = await fetch(pokemonData.species.url);
        if (!speciesResponse.ok) {
          throw new Error(`Failed to fetch species data: ${pokemonData.species.url}`);
        }
        const speciesData = await speciesResponse.json();

        const englishGenus = speciesData.genera.find(genus => genus.language.name === 'en');
        changeText('category', englishGenus ? englishGenus.genus : "Category não encontrada");

    } catch(error){
        console.error("Erro ao buscar species data", error)
    }

    if (pokemonData.abilities && pokemonData.abilities.length > 0) {
      let abilityNames = [];

      for (const abilityEntry of pokemonData.abilities) {
          const abilityUrl = abilityEntry.ability.url;
          try {
                const abilityResponse = await fetch(abilityUrl);
                if (!abilityResponse.ok) {
                  throw new Error("Error ability");
                }
                const abilityData = await abilityResponse.json();

                const englishName = abilityData.names.find(name => name.language.name === 'en');
                abilityNames.push(englishName ? englishName.name : "Sem nome");

          } catch(error){
               console.error("Erro ao buscar ability data", error);
               abilityNames.push("Error do ability");
          }
      }
        changeText('ability-name', abilityNames.join(', '));
    }
  
    const typeContainer = document.querySelector('.type-container');
    typeContainer.innerHTML = ''; 

    if (pokemonData.types && pokemonData.types.length > 0) {
        for (const typeEntry of pokemonData.types) {
            const typeName = typeEntry.type.name;
            const typeBox = document.createElement('span');
            typeBox.classList.add('type-box', `type-${typeName.toLowerCase()}`);
            typeBox.textContent = typeName;
            typeContainer.appendChild(typeBox);
        }
    }
    const versionContainer = document.querySelector('.version-container');
    versionContainer.innerHTML = '';

    const genderContainer = document.querySelector('.gender-container');
    genderContainer.innerHTML = '';
}

function previousPokemon() {
    Index = (Index - 1 + pokemons.length) % pokemons.length;
    display_do_Pokemon(Index);
}

function nextPokemon() {
    Index = (Index + 1) % pokemons.length;
    display_do_Pokemon(Index);
}

ppokemons();