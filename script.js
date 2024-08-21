// Función para crear el primer gráfico
function createFirstChart() {
    d3.json("data.json").then(function (data2) {
        // Dimensiones y configuración del primer gráfico
        const containerWidth = document.querySelector("#chart1").clientWidth;
        const width2 = containerWidth;
        const marginTop2 = 30;
        const marginRight2 = 10;
        const marginBottom2 = 0;
        const marginLeft2 = 110; // Deja espacio para las etiquetas del eje Y
        const height2 = 500;

        // Determinar las series que necesitan ser apiladas
        const series2 = d3.stack()
            .keys(["Sin afectación", "D0", "D1", "D2", "D3", "D4"]) // claves de series
            .value(([, D], key) => D[key]) // obtener valor para cada clave de serie y apilar
            (data2.map(d => [d.state, d])); // agrupar por pila luego clave de serie

        // Preparar las escalas para las codificaciones posicionales y de color
        const x2 = d3.scaleLinear()
            .domain([0, 100])
            .range([marginLeft2, width2 - marginRight2]);

        const y2 = d3.scaleBand()
            .domain(data2.map(d => d.state))
            .range([marginTop2, height2 - marginBottom2])
            .padding(0.08);

        const color2 = d3.scaleOrdinal()
            .domain(series2.map(d => d.key))
            .range(["#00a0d5", "#0594b4", "#4a8795", "#607877", "#69685c", "#6a5742"]) // Colores de las categorías de menor a mayor
            .unknown("#1d1d1b");

        // Función para formatear el valor en la tooltip
        const formatValue2 = x => isNaN(x) ? "N/A" : x.toLocaleString("en") + "%";

        // Crear el contenedor SVG
        const svg2 = d3.select("#chart1")
            .append("svg")
            .attr("width", width2)
            .attr("height", height2)
            .attr("viewBox", [0, 0, width2, height2])
            .attr("style", "max-width: 100%; height: auto;");

        // Añadir un grupo para cada serie y un rectángulo para cada elemento en la serie
        svg2.append("g")
            .selectAll("g")
            .data(series2)
            .join("g")
            .attr("fill", d => color2(d.key))
            .selectAll("rect")
            .data(D => D.map(d => (d.key = D.key, d)))
            .join("rect")
            .attr("x", d => x2(d[0]))
            .attr("y", d => y2(d.data[0]))
            .attr("height", y2.bandwidth())
            .attr("width", d => x2(d[1]) - x2(d[0]))
            .on("mouseover", function(event, d) {
                d3.select(this).append("title")
                  .text(`${d.data[0]} ${d.key}\n${formatValue2(d.data[1][d.key])}`);
            })
            .on("mouseout", function() {
                d3.select(this).select("title").remove();
            });

        // Añadir el eje horizontal
        svg2.append("g")
            .attr("transform", `translate(0,${marginTop2})`)
            .call(d3.axisTop(x2).ticks(width2 / 100, "%"))
            .call(g => g.selectAll(".domain").remove());

        // Añadir el eje vertical
        svg2.append("g")
            .attr("transform", `translate(${marginLeft2},0)`)
            .call(d3.axisLeft(y2).tickSizeOuter(0))
            .call(g => g.selectAll(".domain").remove());
    });
}

// Función para crear el gráfico de arco
function createArcChart() {
    const containerWidth = document.querySelector("#chart2").clientWidth;
    const width1 = containerWidth;
    const height1 = 500;
    const outerRadius1 = Math.min(width1, height1) / 2 - 10;
    const innerRadius1 = outerRadius1 * 0.75;
    const tau1 = 2 * Math.PI;

    // Crear contenedor SVG y centrarlo para el gráfico de arco
    const svg1 = d3.select("#chart2")
        .append("svg")
        .attr("width", width1)
        .attr("height", height1)
        .append("g")
        .attr("transform", `translate(${width1 / 2}, ${height1 / 2})`);

    // Crear escala de colores con tonos azules
    const color1 = d3.scaleOrdinal(["#607877", "#6a5742"]);

    // Definir función de arco
    const arc1 = d3.arc()
        .innerRadius(innerRadius1)
        .outerRadius(outerRadius1)
        .startAngle(0);

    // Datos del gráfico
    const data1 = [
        { label: 'A', value: 0.35 }, // Asegúrate de que los valores estén en formato decimal (0-1)
        { label: 'B', value: 0.65 },
    ];

    // Crear fondo del arco
    svg1.append("path")
        .datum({ endAngle: tau1 })
        .style("fill", "#00a0d5") // Color del arco
        .attr("d", arc1);

    // Crear arcos con datos
    const arcs1 = svg1.selectAll(".arc")
        .data(data1)
        .enter().append("g")
        .attr("class", "arc");

    // Añadir los arcos al gráfico
    arcs1.append("path")
        .attr("d", d => arc1({ endAngle: d.value * tau1 }))
        .attr("fill", d => color1(d.label)) // Usar la escala de colores azules
        .each(function (d) { this._current = d; })
        .on("mouseover", function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", d3.arc()
                    .innerRadius(innerRadius1)
                    .outerRadius(outerRadius1 + 10)
                    .startAngle(0)
                    .endAngle(d.value * tau1)
                );

            // Añadir una etiqueta fija cuando el ratón está sobre el gráfico
            if (d.label === 'B') {
                svg1.append("text")
                    .attr("class", "fixed-tooltip")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("text-anchor", "middle")
                    .style("font-family", "Roboto")
                    .style("font-size", "22px")
                    .style("fill", "#1d1d41") // Color de la etiqueta fija
                    .text("1,963 municipios con afectación");
            }
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", d3.arc()
                    .innerRadius(innerRadius1)
                    .outerRadius(outerRadius1)
                    .startAngle(0)
                    .endAngle(d.value * tau1)
                );
            svg1.selectAll(".tooltip").remove();
            svg1.selectAll(".fixed-tooltip").remove();
        });
}

// Función para crear el mapa de los municipios de México
function createMunicipalityMap() {
    // Cargar el archivo JSON de los municipios de México
    d3.json("mexico_tj.json").then(mexico => {
        // Cargar el archivo CSV con los datos de sequía
        d3.csv("MunicipiosSequia (1).csv").then(data => {
            const color = d3.scaleQuantize([1, 10], d3.schemeBlues[9]);
            const path = d3.geoPath();
            const valuemap = new Map(data.map(d => [d.id, +d.rate])); // Asegúrate de convertir 'rate' a número

            // Extraer los municipios y estados de México del archivo JSON
            const municipios = topojson.feature(mexico, mexico.objects.municipios);
            const estados = topojson.feature(mexico, mexico.objects.estados);
            const statemap = new Map(estados.features.map(d => [d.id, d]));

            // La malla de estados es solo las fronteras internas entre estados
            const statemesh = topojson.mesh(mexico, mexico.objects.estados, (a, b) => a !== b);

            const svg = d3.select("#chart3").append("svg")
                .attr("width", 975)
                .attr("height", 610)
                .attr("viewBox", [0, 0, 975, 610])
                .attr("style", "max-width: 100%; height: auto;");

            svg.append(() => legend(color, { title: "Tasa de sequía (%)", width: 260 }))
                .attr("transform", "translate(870,450)");

            svg.append("g")
                .selectAll("path")
                .data(municipios.features)
                .join("path")
                .attr("fill", d => color(valuemap.get(d.id)))
                .attr("d", path)
                .append("title")
                .text(d => `${d.properties.nombre}, ${statemap.get(d.id.slice(0, 2)).properties.nombre}\n${valuemap.get(d.id)}%`);

            svg.append("path")
                .datum(statemesh)
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-linejoin", "round")
                .attr("d", path);

            return svg.node();
        });
    });
}

// Función para crear la leyenda del mapa
function legend(color, options) {
    const k = 24;
    const arrow = d3.symbol().type(d3.symbolTriangle).size(150)();
    const { title, width } = options;
    const n = Math.floor(Math.sqrt(color.range().length));
    const colors = color.range();
    const labels = ["low", "", "high"];

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", k * n + 20);

    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("transform", `translate(-${k * n / 2},-${k * n / 2}) rotate(-45 ${k * n / 2},${k * n / 2})`)
        .selectAll("rect")
        .data(d3.cross(d3.range(n), d3.range(n)))
        .join("rect")
        .attr("width", k)
        .attr("height", k)
        .attr("x", ([i, j]) => i * k)
        .attr("y", ([i, j]) => (n - 1 - j) * k)
        .attr("fill", ([i, j]) => colors[j * n + i])
        .append("title")
        .text(([i, j]) => `Tasa de sequía ${labels[j] ? `(${labels[j]})` : ""}`);

    svg.append("line")
        .attr("marker-end", arrow)
        .attr("x1", 0)
        .attr("x2", n * k)
        .attr("y1", n * k)
        .attr("y2", n * k)
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);

    svg.append("line")
        .attr("marker-end", arrow)
        .attr("y2", 0)
        .attr("y1", n * k)
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);

    svg.append("text")
        .attr("font-weight", "bold")
        .attr("dy", "0.71em")
        .attr("transform", `rotate(90) translate(${n / 2 * k},6)`)
        .attr("text-anchor", "middle")
        .text("Tasa de sequía");

    svg.append("text")
        .attr("font-weight", "bold")
        .attr("dy", "0.71em")
        .attr("transform", `translate(${n / 2 * k},${n * k + 6})`)
        .attr("text-anchor", "middle")
        .text("Municipios");

    return svg.node();
}

// Llamar a la función para crear el mapa cuando se cargue la página
document.addEventListener("DOMContentLoaded", createMunicipalityMap);


// Llamar a las funciones para crear los gráficos cuando se cargue la página
document.addEventListener("DOMContentLoaded", createFirstChart);
document.addEventListener("DOMContentLoaded", createArcChart);
document.addEventListener("DOMContentLoaded", createMunicipalityMap);
