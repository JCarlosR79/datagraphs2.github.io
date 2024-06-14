// Función para crear el primer gráfico
function createFirstChart() {
    d3.json("data.json").then(function (data2) {

        // Dimensiones y configuración del primer gráfico
        const containerWidth = document.querySelector("#chart1").clientWidth;
        const width2 = containerWidth;
        const marginTop2 = 30;
        const marginRight2 = 10;
        const marginBottom2 = 0;
        const marginLeft2 = 30;
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
            .range(["#0fbaeb", "#129bc9", "#157ba7", "#175c85", "#1a3c63", "#1d1d41"]) // Colores de las categorías
            .unknown("#ccc");

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
    const color1 = d3.scaleOrdinal(["#1f77b4", "#0fbaeb"]);

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
        .style("fill", "#1d1d41") // Color del arco
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
            svg1.append("text")
                .attr("class", "tooltip")
                .attr("x", 0)
                .attr("y", -outerRadius1 - 20)
                .attr("text-anchor", "middle")
                .style("font-family", "Roboto")
                .style("font-size", "14px")
                .style("fill", "#1d1d41") // Color para el texto del tooltip
                .text(d.label + ": " + (d.value * 100).toFixed(1) + "%");

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

// Llamar a la función para crear el primer gráfico cuando se cargue la página
document.addEventListener("DOMContentLoaded", createFirstChart);
document.addEventListener("DOMContentLoaded", createArcChart);
