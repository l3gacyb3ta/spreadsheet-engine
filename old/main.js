import { CellSum, CellValue, Graph, Sheet } from "./model";

import ReactDOMServer from 'react-dom/server';

let sheet = new Sheet(2,2);

let graph = sheet.graph;
const a = graph.newValue(1);
const b = graph.newValue(3);
const a_b = new CellSum();

const a_b_node = graph.addNode(a_b);
graph.connectNodes(a_b_node, a);
graph.connectNodes(a_b_node, b);

const c = graph.newValue(4);

const c_ab = new CellSum();
const c_ab_node = graph.addNode(c_ab);
graph.connectNodes(c_ab_node, a_b_node);
graph.connectNodes(c_ab_node, c);



let x = sheet.add_node(0, 0, new CellValue(5))
let y = sheet.add_node(1, 0, new CellValue(7))
let xy = sheet.add_node(0, 1, new CellSum());

sheet.graph.connectNodes(xy, x);
sheet.graph.connectNodes(xy, y);


// console.log(sheet.graph.getNodeValue(xy));

let thing = ReactDOMServer.renderToString(sheet.render());

Bun.serve({
    fetch(req) {
        console.log("hey")
      return new Response(thing, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
  });
  