import boardRoutes from "../src/routes/board.routes.js";

const routes = boardRoutes.stack
  .filter((layer) => layer.route)
  .map((layer) => ({
    path: layer.route?.path,
    methods: Object.keys(layer.route?.methods ?? {}),
  }));

console.log(routes);
