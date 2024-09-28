
    
    const url = require('url');
    const http = require('http');
    const fs = require('fs'); // FileSystem
    const path = require('path'); // Agrego el path porque no me tomaba 
    
    // Archivo donde se almacenarán las materias
    const dataFilePath = 'data.json';
    
   let materiasList=[];
    
    // Controla si el archivo existe y está vacío al comenzar
    if (!fs.existsSync(dataFilePath)) {
        fs.writeFileSync(dataFilePath, JSON.stringify([]));
    }
    
    const servidor = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        let records = JSON.parse(fs.readFileSync(dataFilePath)); // Leer todos los registros al inicio
    
        // Ruta raíz ("/"): Servir la página HTML
        if (req.method === "GET" && parsedUrl.pathname === "/materias") {
            fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error al leer el archivo HTML.');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
    
        // Ruta para obtener todas las materias
        } else if (req.method === "GET" && parsedUrl.pathname === "/") {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(records));
    
        // Ruta para agregar una nueva materia (POST)
        } else if (req.method === "POST" && parsedUrl.pathname === "/materias") {
            let body = ''; // Acumular los datos del cuerpo
            req.on('data', chunk => {
                body += chunk.toString(); // Convertir el chunk a string
            });
            req.on('end', () => {
                const newRecord = JSON.parse(body); // Analizar el JSON recibido
                newRecord.id = records.length + 1; // Asignar un nuevo ID
                records.push(newRecord); // Agregar al array de registros
                fs.writeFileSync(dataFilePath, JSON.stringify(records)); // Guardar en el archivo
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newRecord)); // Enviar el nuevo registro como respuesta
            });
    
        // Ruta para actualizar una materia existente (PUT)
        } else if (req.method === "PUT" && parsedUrl.pathname.match(/\/materias\/\d+/)) {
            const id = parsedUrl.pathname.split('/')[2]; // Obtener el ID de la materia
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const updatedRecord = JSON.parse(body);
                const index = records.findIndex(r => r.id == id); // Buscar el registro por ID
                if (index !== -1) {
                    records[index] = { ...records[index], ...updatedRecord }; // Actualizar el registro
                    fs.writeFileSync(dataFilePath, JSON.stringify(records)); // Guardar cambios
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(records[index])); // Devolver el registro actualizado
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Registro no encontrado." }));
                }
            });
    
        // Ruta para eliminar una materia existente (DELETE)
        } else if (req.method === "DELETE" && parsedUrl.pathname.match(/\/materias\/\d+/)) {
            const id = parsedUrl.pathname.split('/')[2]; // Obtener el ID de la materia
            const index = records.findIndex(r => r.id == id); // Buscar el registro por ID
            if (index !== -1) {
                records.splice(index, 1); // Eliminar el registro
                fs.writeFileSync(dataFilePath, JSON.stringify(records)); // Guardar los cambios
                res.writeHead(204); // Sin contenido, se eliminó exitosamente
                res.end();
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Registro no encontrado." }));
            }
    
        // Si no coincide con ninguna ruta válida
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Ruta no encontrada." }));
        }
    });
    
    // Escuchar en el puerto 3000
    const PORT = 3000;
    servidor.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });