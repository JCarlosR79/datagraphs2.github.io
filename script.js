// script.js

// Setup SVG dimensions
const width = 800;
const height = 600;
const radius = Math.min(width, height) / 2;

// Create SVG container and center it
const svg = d3.select("svg")
    .attr("width", width) // Ancho del SVG
    .attr("height", height) // Alto del SVG
    .append("g") // Añadir un grupo 'g' dentro del SVG
    .attr("transform", `translate(${width / 2}, ${height / 2})`); // Mover el grupo 'g' al centro del SVG

// Create a color scale using D3's categorical color scheme
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Define arc generator with inner and outer radius
const arc = d3.arc()
    .innerRadius(0) // Radio interno del arco (0 para gráfico de pastel)
    .outerRadius(radius); // Radio externo del arco

// Define pie generator to compute the angles for each slice
const pie = d3.pie()
    .value(d => d.value) // Valor de cada porción basado en la propiedad 'value'
    .sort(null); // No ordenar las porciones

// Load CSV data
d3.csv("data.csv").then(data => {
    // Convert data values from strings to numbers
    data.forEach(d => {
        d.value = +d.value; // Convertir 'value' de cadena a número
    });

    // Append arcs for each slice of the pie chart
    const arcs = svg.selectAll(".arc")
        .data(pie(data)) // Vincular datos procesados con los elementos del DOM
        .enter().append("g") // Crear un grupo 'g' para cada porción
        .attr("class", "arc"); // Asignar clase 'arc' a cada grupo

    // Append path elements to each group and set their attributes
    arcs.append("path")
        .attr("d", arc) // Definir la forma del arco usando el generador de arcos
        .attr("fill", d => color(d.data.label)) // Asignar color basado en la etiqueta de datos
        .each(function(d) { this._current = d; }); // Almacenar los ángulos iniciales

    // Function to handle the transition animation
    function arcTween(a) {
        const i = d3.interpolate(this._current, a); // Interpolador entre ángulos actuales y nuevos
        this._current = i(0); // Actualizar ángulos actuales
        return t => arc(i(t)); // Devolver el valor interpolado para el tiempo 't'
    }

    // Update arcs with a transition animation
    svg.selectAll("path")
        .data(pie(data)) // Volver a vincular los datos con los elementos del DOM
        .transition() // Iniciar transición
        .duration(1000) // Duración de la transición en milisegundos
        .attrTween("d", arcTween); // Aplicar interpolación a los atributos 'd'
});
