import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TransactionStep } from '../types';

interface TransactionFlowProps {
  steps: TransactionStep[];
}

const TransactionFlow: React.FC<TransactionFlowProps> = ({ steps }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || steps.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 200;
    const padding = 60;
    const nodeRadius = 24; // Slightly larger for better visibility

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Define scales
    const xScale = d3.scaleLinear()
      .domain([0, steps.length - 1])
      .range([padding, width - padding]);

    // Draw connecting lines
    steps.forEach((step, index) => {
      if (index < steps.length - 1) {
        svg.append("line")
          .attr("x1", xScale(index))
          .attr("y1", height / 2)
          .attr("x2", xScale(index + 1))
          .attr("y2", height / 2)
          .attr("stroke", "#475569") // Slate 600
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", step.status === 'pending' ? "4" : "0");
      }
    });

    // Draw nodes
    const nodes = svg.selectAll(".node")
      .data(steps)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d, i) => `translate(${xScale(i)}, ${height / 2})`);

    // Node Circles
    nodes.append("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => {
        if (d.status === 'success') return "#059669"; // Emerald 600 (Darker)
        if (d.status === 'failed') return "#dc2626"; // Red 600
        if (d.status === 'warning') return "#d97706"; // Amber 600
        return "#475569"; // Slate 600 (Pending)
      })
      .attr("stroke", "#1e293b") // Slate 800
      .attr("stroke-width", 4);

    // Status Icons/Text inside circles
    nodes.append("text")
      .text(d => {
        if (d.status === 'success') return "✓";
        if (d.status === 'failed') return "✕";
        if (d.status === 'warning') return "!";
        return "⋯";
      })
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "#ffffff")
      .attr("font-weight", "bold")
      .attr("font-size", "16px");

    // Labels (Step Name) - Top
    nodes.append("text")
      .text(d => d.stepName)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("fill", "#e2e8f0") // Slate 200
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.5px");

    // Labels (Entity/System) - Bottom Primary
    nodes.append("text")
      .text(d => d.entity)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8") // Slate 400
      .attr("font-size", "11px");

    // Time Labels - Bottom Secondary (Monospace for precision)
    nodes.append("text")
      .text(d => {
          if (!d.timestamp) return "--:--:--";
          try {
            const date = new Date(d.timestamp);
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
          } catch(e) {
            return "";
          }
      })
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b") // Slate 500
      .attr("font-size", "9px")
      .attr("font-family", "JetBrains Mono, monospace");

    // Tooltip behavior
    nodes.append("title")
        .text(d => `[${d.status.toUpperCase()}] ${d.description}\n\nLog: ${d.logSnippet}`);

  }, [steps]);

  return (
    <div className="w-full h-[200px] bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm overflow-hidden relative shadow-inner">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default TransactionFlow;