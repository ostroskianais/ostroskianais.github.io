// https://observablehq.com/@ostroskianais/chord-dependency-diagram@435
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["state_code_VW@1.csv",new URL("./files/64712a6d7719a086ada2bded372f87bfa4d131cbb599c815b8eee3c5f85824870265b81dbdaf38fff8bb8c110adb51ad83c2aebffefea9cf56ed77eaf4e90359",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Chord Dependency Diagram

The [chord diagram](/@mbostock/d3-chord-diagram) has been adapted to show inflows and outflows between states. The data is from a work-in-progress. The chart was also adapted to include a hover interaction which will highlight all links to and from a given state.`
)});
  main.variable(observer("chart")).define("chart", ["d3","width","height","chord","matrix","color","names","ribbon","outerRadius","arc"], function(d3,width,height,chord,matrix,color,names,ribbon,outerRadius,arc)
{
  const svg = d3.create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

  const chords = chord(matrix);
  
  // arc groups
  const group = svg.append("g")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
    .selectAll("g")
    .data(chords.groups)
    .join("g");
  
  // ribbons
  const ribbons =  svg.append("g")
      .attr("fill-opacity", 0.75)
    .selectAll("path")
    .data(chords)
    .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("fill", d => color(names[d.source.index]))
      .attr("d", ribbon);
  
  // state codes    
  group.append("text")
      .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
      .attr("dy", "0.35em")
      .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 5})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
      .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
      .text(d => names[d.index]);
  
    // arc and hover interaction (has to be after "ribbons" is declared ) 
  group.append("path")
      .attr("fill", d => color(names[d.index]))
      .attr("d", arc)
      .on("mouseover", function(event,d){
        d3.selectAll(group)
          .style("opacity", function(dd) {return (dd.index != d.index) ? 0.2 : 1.0;})
        d3.selectAll(ribbons)
          .style("opacity", function(dd) {
          return (dd.source.index != d.index && dd.target.index != d.index) ? 0.2 : 1.0;})
      })
      .on("mouseout", function(event){
        d3.selectAll(group)
          .style("opacity",1)
        d3.selectAll(ribbons)
          .style("opacity",1)
      });

  // text to show value of incoming and outgoing values of each state when hovering over arc
  group.append("title")
      .text(d => `${names[d.index]}
${d3.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
${d3.sum(chords, c => (c.target.index === d.index) * c.source.value)} incoming ←`);
  
  // text to show value of the specific link as "ORIGIN -> DESTINATION VALUE"
  // if this piece of code is added earlier, it hampers the mouseover interactions from working for some reason
  ribbons.append("title") 
         .text(d => `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`)

  return svg.node();
}
);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("state_code_VW@1.csv").text(), d3.autoType)
)});
  main.variable(observer("rename")).define("rename", function(){return(
name => name.substring(name.indexOf(".") + 1, name.lastIndexOf("."))
)});
  main.variable(observer("names")).define("names", ["data","d3"], function(data,d3){return(
Array.from(new Set(data.flatMap(d => [d.source, d.target]))).sort(d3.ascending)
)});
  main.variable(observer("matrix")).define("matrix", ["names","data"], function(names,data)
{
  const index = new Map(names.map((name, i) => [name, i]));
  const matrix = Array.from(index, () => new Array(names.length).fill(0));
  for (const {source, target, value} of data) matrix[index.get(source)][index.get(target)] += value;
  return matrix;
}
);
  main.variable(observer("chord")).define("chord", ["d3","innerRadius"], function(d3,innerRadius){return(
d3.chordDirected()
    .padAngle(10 / innerRadius)
    .sortGroups(d3.descending)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)
)});
  main.variable(observer("arc")).define("arc", ["d3","innerRadius","outerRadius"], function(d3,innerRadius,outerRadius){return(
d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
)});
  main.variable(observer("ribbon")).define("ribbon", ["d3","innerRadius"], function(d3,innerRadius){return(
d3.ribbonArrow()
    .radius(innerRadius - 1)
    .padAngle(1 / innerRadius)
)});
  main.variable(observer("color")).define("color", ["d3","names"], function(d3,names){return(
d3.scaleOrdinal(names, d3.quantize(d3.interpolateRainbow, names.length))
)});
  main.variable(observer("outerRadius")).define("outerRadius", ["innerRadius"], function(innerRadius){return(
innerRadius + 10
)});
  main.variable(observer("innerRadius")).define("innerRadius", ["width","height"], function(width,height){return(
Math.min(width, height) * 0.5 - 90
)});
  main.variable(observer("width")).define("width", function(){return(
954
)});
  main.variable(observer("height")).define("height", ["width"], function(width){return(
width
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
