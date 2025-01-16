// Cargar las industrias desde BD/industrias.json
fetch('../BD/industrias.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos cargados:', data); // Depuración: Verificar datos cargados
        const industrySelect = document.getElementById('industry');
        data.forEach(industry => {
            const option = document.createElement('option');
            option.value = industry;
            option.textContent = industry;
            industrySelect.appendChild(option);
        });

        // Manejar la selección de "Otro"
        industrySelect.addEventListener('change', (event) => {
            const otherIndustryDiv = document.getElementById('otherIndustry');
            if (event.target.value === 'Otro') {
                otherIndustryDiv.style.display = 'block'; // Mostrar campo de texto
            } else {
                otherIndustryDiv.style.display = 'none'; // Ocultar campo de texto
            }
        });
    })
    .catch(error => {
        console.error('Error cargando industrias:', error); // Depuración: Verificar errores
    });