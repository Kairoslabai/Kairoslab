// API Key de CORE (colócala directamente aquí)
const coreApiKey = 'Db8mQKd1FVHhNuJzvorxSj3TMyB7qOUA'; // Reemplaza con tu API Key de CORE

const deepseekApiKey = 'sk-108394a9c75b4cc7b967d85f29371075'; // API Key de DeepSeek
const deepseekApiUrl = "https://api.deepseek.com/v1/chat/completions";

// Función para buscar en CORE y obtener resultados
async function searchCORE(query, offset = 0) {
  const url = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&limit=10&offset=${offset}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${coreApiKey}` // Usar la API Key de CORE directamente
    }
  });

  if (!response.ok) {
    throw new Error(`Error al buscar en CORE: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
}

// Función para enviar la consulta a Deepseek
async function askDeepseek(query, coreResults) {
  const context = coreResults.map(result => result.title + ': ' + (result.abstract || 'Sin resumen disponible.')).join('\n\n');
  const prompt = `Eres un experto en Antropología Social, Psicología Social especializado en la cultura de los países y Mercadólogo. Basado en la siguiente información de CORE:\n\n${context}\n\nResponde a la siguiente pregunta: ${query}

Además, para enriquecer el análisis, utiliza la información relevante de los siguientes archivos JSON ubicados en el directorio BD/:

1. **Felicidad**:
   - Satisfacción con la vida.
   - Status general del país (2020-2022).
   - World Happiness Report 2024.

2. **Población**:
   - Población femenina y masculina en el rango de 15 a 64 años.
   - Proyecciones de población (2020-2035).

3. **Sesgos**:
   - Sesgos culturales o sociales relevantes.

4. **Valores**:
   - Status general del país en 2022.

Proporciona un análisis completo del país seleccionado, incluyendo:
- Datos de felicidad y satisfacción con la vida, desde una perspectiva antropológica y psicológica.
- Información demográfica, analizando su impacto en la cultura y el mercado.
- Identificación de los sesgos más representativos de la cultura del país, explicando su relevancia desde un enfoque psicológico y antropológico.
- Valores y status general del país, considerando su influencia en el comportamiento del consumidor y las estrategias de mercado.

En la conclusión, integra los datos, los agregados y el análisis de las dimensiones de Hofstede, proporcionando una visión integral de la investigación desde las perspectivas de Antropología Social, Psicología Social y Mercadotecnia. Evita mencionar explícitamente los archivos JSON o su origen en la respuesta final.

Asegúrate de estructurar la respuesta de manera clara y detallada, sin incluir símbolos "#", espacios innecesarios entre párrafos o citas que no aporten valor al usuario final.`;

  const requestBody = {
    model: "deepseek-chat",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  };

  const response = await fetch(deepseekApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${deepseekApiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al consultar la API de Deepseek: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Función para formatear la respuesta de Deepseek en HTML
function formatResponseAsHTML(response) {
  // Eliminar símbolos "#" y espacios innecesarios
  let formattedResponse = response.replace(/#/g, '').replace(/\n\s*\n/g, '\n\n');

  // Convertir encabezados principales en <h2> con color rojo
  formattedResponse = formattedResponse.replace(/^(.*?)\n/g, '<h2 style="color: red;">$1</h2>');

  // Convertir encabezados secundarios en <h3> con color rojo
  formattedResponse = formattedResponse.replace(/^(.*?)\n/g, '<h3 style="color: red;">$1</h3>');

  // Convertir negritas (**texto**) en <strong>
  formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convertir guiones (-) en listas <ul>
  formattedResponse = formattedResponse.replace(/- (.*?)\n/g, '<li>$1</li>');
  formattedResponse = formattedResponse.replace(/<li>/g, '<ul><li>').replace(/<\/li>/g, '</li></ul>');

  // Convertir saltos de línea (\n) en <br> o <p>
  formattedResponse = formattedResponse.replace(/\n/g, '<br>');

  // Envolver en un contenedor HTML
  return `<div class="deepseek-response">${formattedResponse}</div>`;
}

// Función principal para realizar la búsqueda
async function search(query) {
  const deepseekResponseDiv = document.getElementById('deepseekResponse');

  // Mostrar mensaje de carga
  deepseekResponseDiv.innerHTML = '<p>Construyendo respuesta...</p>';

  try {
    // Paso 1: Buscar en CORE
    const coreResults = await searchCORE(query);
    if (coreResults.length === 0) {
      deepseekResponseDiv.innerHTML = '<p>No se encontraron resultados en CORE para generar una respuesta.</p>';
      return;
    }

    // Paso 2: Enviar los resultados de CORE a Deepseek
    const deepseekResponse = await askDeepseek(query, coreResults);

    // Paso 3: Formatear la respuesta como HTML
    const formattedResponse = formatResponseAsHTML(deepseekResponse);

    // Paso 4: Mostrar la respuesta formateada
    deepseekResponseDiv.innerHTML = formattedResponse;
  } catch (error) {
    console.error('Error:', error);
    deepseekResponseDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

// Ejemplo de uso: Llamar a la función search con una consulta relacionada con el país seleccionado
document.getElementById('paises').addEventListener('change', (event) => {
  const pais = event.target.value;
  if (pais) {
    const query = `Análisis cultural de ${pais} según Hofstede`;
    search(query);
  }
});