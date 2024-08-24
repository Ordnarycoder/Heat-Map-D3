document.addEventListener('DOMContentLoaded', function () {
  const width = 1000;
  const height = 500;
  const margin = { top: 50, right: 30, bottom: 100, left: 80 };
  const legendWidth = 300;
  const legendHeight = 20;

  const svg = d3.select('#heatmap').
  append('svg').
  attr('width', width + margin.left + margin.right).
  attr('height', height + margin.top + margin.bottom).
  append('g').
  attr('transform', `translate(${margin.left},${margin.top})`);

  fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json').
  then(response => response.json()).
  then(data => {
    const baseTemp = data.baseTemperature;
    const monthlyData = data.monthlyVariance;

    const xScale = d3.scaleBand().
    domain(monthlyData.map(d => d.year)).
    range([0, width]).
    padding(0.05);

    const yScale = d3.scaleBand().
    domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).
    range([0, height]).
    padding(0.05);

    const colorScale = d3.scaleQuantile().
    domain(d3.extent(monthlyData, d => baseTemp + d.variance)).
    range(['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']);

    const xAxis = d3.axisBottom(xScale).
    tickValues(xScale.domain().filter((year, i) => year % 10 === 0)).
    tickFormat(d3.format('d'));

    const yAxis = d3.axisLeft(yScale).
    tickFormat(month => d3.timeFormat('%B')(new Date(0).setUTCMonth(month)));

    svg.append('g').
    attr('id', 'x-axis').
    attr('transform', `translate(0, ${height})`).
    call(xAxis);

    svg.append('g').
    attr('id', 'y-axis').
    call(yAxis);

    svg.selectAll('.cell').
    data(monthlyData).
    enter().
    append('rect').
    attr('class', 'cell').
    attr('x', d => xScale(d.year)).
    attr('y', d => yScale(d.month - 1)).
    attr('width', xScale.bandwidth()).
    attr('height', yScale.bandwidth()).
    attr('fill', d => colorScale(baseTemp + d.variance)).
    attr('data-year', d => d.year).
    attr('data-month', d => d.month - 1).
    attr('data-temp', d => baseTemp + d.variance).
    on('mouseover', (event, d) => {
      tooltip.style('visibility', 'visible').
      attr('data-year', d.year).
      html(`Year: ${d.year}<br>Month: ${d3.timeFormat('%B')(new Date(0).setUTCMonth(d.month - 1))}<br>Temp: ${(baseTemp + d.variance).toFixed(2)}°C`);
    }).
    on('mousemove', event => {
      tooltip.style('top', `${event.pageY - 10}px`).
      style('left', `${event.pageX + 10}px`);
    }).
    on('mouseout', () => tooltip.style('visibility', 'hidden'));

    const legend = d3.select('#legend').
    append('svg').
    attr('width', legendWidth).
    attr('height', legendHeight);

    const legendScale = d3.scaleLinear().
    domain(d3.extent(monthlyData, d => baseTemp + d.variance)).
    range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale).
    tickValues(colorScale.quantiles()).
    tickFormat(d3.format('.2f'));

    legend.selectAll('rect').
    data(colorScale.range().map(color => {
      const d = colorScale.invertExtent(color);
      if (!d[0]) d[0] = legendScale.domain()[0];
      if (!d[1]) d[1] = legendScale.domain()[1];
      return d;
    })).
    enter().
    append('rect').
    attr('x', d => legendScale(d[0])).
    attr('width', d => legendScale(d[1]) - legendScale(d[0])).
    attr('height', legendHeight).
    attr('fill', d => colorScale(d[0]));

    legend.append('g').
    attr('transform', `translate(0, ${legendHeight})`).
    call(legendAxis);

    const tooltip = d3.select('body').
    append('div').
    attr('id', 'tooltip').
    style('position', 'absolute').
    style('visibility', 'hidden');
  });
});