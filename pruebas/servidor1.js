const http = require('http');
const url = require('url');
const fs = require('fs');

const dataFilePath = 'data.json';


// Asegúrate de que el archivo exista y esté vacío al inicio
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

const servidor = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    const records = JSON.parse(fs.readFileSync(dataFilePath)); // Leer todos los registros al inicio

    res.setHeader('Content-Type', 'application/json');

    // Manejo de los métodos HTTP
    if (req.method === "GET") {
        if (parsedUrl.pathname === "/materias") {
            // Devuelve todos los registros
            res.writeHead(200);
            res.end(JSON.stringify(records));
        } else if (parsedUrl.pathname.match(/\/materias\/\d+/)) {
            // Devuelve un registro específico
            const id = parsedUrl.pathname.split('/')[2];
            const record = records.find(r => r.id == id);
            if (record) {
                res.writeHead(200);
                res.end(JSON.stringify(record));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ message: "Registro no encontrado." }));
            }
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: "Ruta no encontrada." }));
        }
    } else if (req.method === "POST" && parsedUrl.pathname === "/materias") {
        // Agregar un nuevo registro
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convertir Buffer a string
        });
        req.on('end', () => {
            const newRecord = JSON.parse(body);
            newRecord.id = records.length + 1; // Asignar un ID
            records.push(newRecord);
            fs.writeFileSync(dataFilePath, JSON.stringify(records)); // Guardar datos
            res.writeHead(201);
            res.end(JSON.stringify(newRecord));
        });
    } else if (req.method === "PUT" && parsedUrl.pathname.match(/\/materias\/\d+/)) {
        // Actualizar un registro existente
        const id = parsedUrl.pathname.split('/')[2];
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedRecord = JSON.parse(body);
            const index = records.findIndex(r => r.id == id);
            if (index !== -1) {
                records[index] = { ...records[index], ...updatedRecord };
                fs.writeFileSync(dataFilePath, JSON.stringify(records));
                res.writeHead(200);
                res.end(JSON.stringify(records[index]));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ message: "Registro no encontrado." }));
            }
        });
    } else if (req.method === "DELETE" && parsedUrl.pathname.match(/\/materias\/\d+/)) {
        // Eliminar un registro
        const id = parsedUrl.pathname.split('/')[2];
        const index = records.findIndex(r => r.id == id);
        if (index !== -1) {
            records.splice(index, 1);
            fs.writeFileSync(dataFilePath, JSON.stringify(records));
            res.writeHead(204); // No Content
            res.end();
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: "Registro no encontrado." }));
        }
    } else {
        res.writeHead(405); // Method Not Allowed
        res.end(JSON.stringify({ message: "Método no permitido." }));
    }
});



servidor.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');

});
