const claveApi = 'AIzaSyDUh-5jLX1CYpChTGuyEXEObjIL2JyCIuI';
const idHoja = '1j0Q6GEwEec4-kn8o8NWKaNGarh7lzsjge22dalsKkmo';
const nombreHoja = 'PreguntasPagina';
const url = `https://sheets.googleapis.com/v4/spreadsheets/${idHoja}/values/${nombreHoja}?key=${claveApi}`;

document.addEventListener('DOMContentLoaded', () => {
    fetch(url)
        .then(response => response.json())
        .then(data => generarFormulario(data.values.slice(1), data.values[0]))
        .catch(error => console.error('Error al obtener los datos:', error));
});

function generarFormulario(datos, encabezados) {
    const formulario = document.getElementById('formulario');
    let seccionActual = '', grupoOpciones = null;
    const clases = {
        etiqueta: 'etiqueta',
        desplegable: 'desplegable',
        campoTexto: 'campo-texto',
        descripcion: 'descripcion'
    };
    const indices = {
        seccion: encabezados.indexOf('seccion'),
        opcion: encabezados.indexOf('opcion'),
        pregunta: encabezados.indexOf('pregunta'),
        descripcion: encabezados.indexOf('descripcion'),
    };

    datos.forEach(fila => {
        const [seccion, opcion, pregunta, descripcion] = [fila[indices.seccion], fila[indices.opcion], fila[indices.pregunta], fila[indices.descripcion]];
        const preguntaId = convertirEspaciosPorGuiones(pregunta);

        if (seccion !== seccionActual) {
            seccionActual = seccion;
            const seccionElement = crearElemento('div', { className: 'seccion', 'data-seccion': seccion });
            seccionElement.appendChild(crearElemento('p', { className: 'linea-separadora' }));
            formulario.appendChild(seccionElement);
        }

        const seccionElement = formulario.querySelector(`div[data-seccion="${seccion}"]`);

        if (opcion === '0') {
            seccionElement.appendChild(crearElemento('label', { for: preguntaId, innerText: pregunta, className: clases.etiqueta }));
            const select = crearElemento('select', { id: preguntaId, name: preguntaId, className: clases.desplegable });
            select.appendChild(crearElemento('option', { value: '', innerText: '-- Seleccione una opción --' }));
            seccionElement.appendChild(select);
            grupoOpciones = select;

            select.addEventListener('change', e => actualizarSubseccionesYDescripcion(e, seccion, preguntaId, descripcion));
            seccionElement.appendChild(crearElemento('small', { innerText: '', id: `descripcion-${preguntaId}`, className: clases.descripcion }));

        } else {
            if (grupoOpciones && opcion !== "") {
                const opcionElemento = crearElemento('option', { value: opcion, innerText: pregunta, 'data-descripcion': descripcion });
                grupoOpciones.appendChild(opcionElemento);
            } else {
                seccionElement.appendChild(crearElemento('label', { for: preguntaId, innerText: pregunta, className: clases.etiqueta }));
                seccionElement.appendChild(crearElemento('input', { type: 'text', id: preguntaId, name: preguntaId, className: clases.campoTexto }));
                if (descripcion) seccionElement.appendChild(crearElemento('small', { innerText: descripcion, className: clases.descripcion }));
            }
        }
    });

    document.querySelectorAll(`div[data-seccion]`).forEach(subSeccion => {
        if (subSeccion.dataset.seccion.includes('.')) subSeccion.style.display = 'none';
    });
}

function convertirEspaciosPorGuiones(str) {
    return str.replace(/\s+/g, '-');
}

function crearElemento(tipo, atributos) {
    const elemento = document.createElement(tipo);
    for (let [clave, valor] of Object.entries(atributos)) {
        if (clave.startsWith('data-')) elemento.dataset[clave.replace('data-', '')] = valor;
        else elemento[clave] = valor;
    }
    return elemento;
}

function actualizarSubseccionesYDescripcion(e, seccion, pregunta, descripcion) {
    document.querySelectorAll(`div[data-seccion^="${seccion}."]`).forEach(subSeccion => subSeccion.style.display = 'none');
    if (e.target.value !== '') document.querySelectorAll(`div[data-seccion="${seccion}.${e.target.value}"]`).forEach(subSeccion => subSeccion.style.display = '');
    const descripcionElemento = document.querySelector(`#descripcion-${pregunta}`);
    const selectedOption = e.target.options[e.target.selectedIndex];
    if (descripcionElemento && selectedOption) descripcionElemento.innerText = selectedOption.dataset.descripcion || '';
}

