const fs = require('fs');
const path = require('path');

const swagger = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'));
const rows = [];

for (const [url, ops] of Object.entries(swagger.paths || {})) {
  for (const [method, op] of Object.entries(ops)) {
    if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue;
    rows.push({
      method,
      url,
      summary: op.summary || '',
      description: op.description || '',
      deprecated: Boolean(op.deprecated),
      tags: op.tags || [],
      security: op.security,
      consumes: op.consumes || [],
      parameters: (op.parameters || []).map((item) => ({
        name: item.name,
        in: item.in,
        required: Boolean(item.required),
        type: item.schema ? (item.schema.type || item.schema.$ref || item.schema.format || '') : item.type || ''
      }))
    });
  }
}

console.log(JSON.stringify({ count: rows.length, rows }, null, 2));
