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
            .range(["#d3d3d3", "#ffff00", "#ffcc00", "#ff9900", "#ff3300", "#990000"]) // Colores de las categorías
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

// Llamar a la función para crear el primer gráfico cuando se cargue la página
document.addEventListener("DOMContentLoaded", createFirstChart);
