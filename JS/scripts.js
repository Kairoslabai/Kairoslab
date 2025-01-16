document.addEventListener('DOMContentLoaded', function () {
    // Cargar los países desde el archivo naciones.json (formato SDMX)
    fetch('BD/naciones.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el archivo naciones.json');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos cargados de naciones.json:', data); // Depuración: Verifica los datos cargados
            const select = document.getElementById('paises');

            // Verificar si los datos son un objeto con la propiedad "countries"
            if (data && Array.isArray(data.countries)) {
                // Limpiar el menú desplegable antes de llenarlo
                select.innerHTML = '<option value="">-- Selecciona un país --</option>';

                // Llenar el menú desplegable con los nombres de los países en español
                data.countries.forEach(pais => {
                    const option = document.createElement('option');
                    option.value = pais.name.es; // Usamos el nombre en español como valor
                    option.textContent = pais.name.es; // Mostramos el nombre en español
                    select.appendChild(option);
                });
            } else {
                console.error('El archivo naciones.json no contiene un array válido en la propiedad "countries".');
            }
        })
        .catch(error => {
            console.error('Error al cargar los países:', error);
        });

    // Manejar el cambio de selección en el menú desplegable
    document.getElementById('paises').addEventListener('change', function (event) {
        const selectedCountry = event.target.value;
        if (selectedCountry) {
            console.log('País seleccionado:', selectedCountry);

            // Buscar los datos del país seleccionado en paises.json (formato SDMX)
            fetch('BD/paises.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al cargar el archivo paises.json');
                    }
                    return response.json();
                })
                .then(data => {
                    // Buscar el país seleccionado por su nombre en español
                    const paisSeleccionado = data.countries.find(pais => pais.name.es === selectedCountry);
                    if (paisSeleccionado) {
                        console.log('Datos del país:', paisSeleccionado);
                        // Actualizar la gráfica con los datos del país seleccionado
                        if (typeof window.updateChart === 'function') {
                            window.updateChart(paisSeleccionado.dimensiones);
                        } else {
                            console.error('La función window.updateChart no está definida.');
                        }
                    } else {
                        console.error('No se encontraron datos para el país seleccionado.');
                    }
                })
                .catch(error => {
                    console.error('Error al cargar los datos del país:', error);
                });
        }
    });
});