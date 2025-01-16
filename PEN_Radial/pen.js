// Función para inicializar la gráfica
function initChart() {
  // Crear el elemento raíz
  var root = am5.Root.new("grafica-container");

  // Establecer temas
  root.setThemes([
      am5themes_Animated.new(root)
  ]);

  // Crear la gráfica de radar
  var chart = root.container.children.push(am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX"
  }));

  // Añadir cursor
  var cursor = chart.set("cursor", am5radar.RadarCursor.new(root, {
      behavior: "zoomX"
  }));
  cursor.lineY.set("visible", false);

  // Crear ejes
  var xRenderer = am5radar.AxisRendererCircular.new(root, {});
  xRenderer.labels.template.setAll({
      radius: 10
  });

  var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: "dimension",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
  }));

  var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5radar.AxisRendererRadial.new(root, {})
  }));

  // Crear la serie
  var series = chart.series.push(am5radar.RadarLineSeries.new(root, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      categoryXField: "dimension",
      tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}"
      })
  }));

  series.strokes.template.setAll({
      strokeWidth: 2
  });

  series.bullets.push(function () {
      return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
              radius: 5,
              fill: series.get("fill")
          })
      });
  });

  // Función para actualizar la gráfica con nuevos datos
  window.updateChart = function (dimensiones) {
      // Convertir los datos al formato esperado por amCharts
      var data = Object.keys(dimensiones).map(function (key) {
          return {
              dimension: key,
              value: dimensiones[key]
          };
      });

      // Actualizar los datos de la serie y el eje X
      series.data.setAll(data);
      xAxis.data.setAll(data);
  };

  // Inicializar la gráfica con datos vacíos
  updateChart({});
}

// Inicializar la gráfica cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  initChart();
});