"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
// Singleton Prisma client — one connection pool for the entire process.
// Import `db` everywhere DB access is needed.
exports.db = new client_1.PrismaClient();
//# sourceMappingURL=db.js.map