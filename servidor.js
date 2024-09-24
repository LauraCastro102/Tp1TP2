const http = require('http');
const url = require('url');
const fs = require('fs'); //FileSystem
const path = require('path');//agrego el path porque no me tomaba 
//configurado para manejar las solic del html

// para almacenar las materias
const dataFilePath = 'data.json';

// controla si el archivo existe y esta vacio al comenzar
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
}




const servidor = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let records = JSON.parse(fs.readFileSync(dataFilePath)); // Leer todos los registros al inicio

    res.setHeader('Content-Type', 'application/json');//devuelve el contenido tipo json

    // manipulacion de HTTP
    if (req.method === "GET" && parsedUrl.pathname === "/") {
        res.writeHead(200);
        //res.end("Bienvenido a la API de Materias");
         // busca el index cuando la ruta es la ruta es "/"
        res.setHeader('Content-Type', 'text/html'); 
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error al leer el archivo HTML.');
            } else {
                res.writeHead(200);
                res.end(data);
            }
        });
        }else if (req.method === "GET" && parsedUrl.pathname === "/materias") {
           
            res.writeHead(200); // aca trae todos los registros
            res.end(JSON.stringify(records));  
    } else if (req.method === "POST" && parsedUrl.pathname === "/materias") {
        // cargar nuevo registro
        let body = ''; //
        req.on('data', chunk => { //aca recibe el bloque de datos
            body += chunk.toString(); // acumula los datos y los pasa a string 
        });
        req.on('end', () => {
            const newRecord = JSON.parse(body); // analiza el cuerpo de la solicitud (JSON)
            newRecord.id = records.length + 1; // le da  un id  al nevo registro
            records.push(newRecord);  //le agrega un registro al array "records"
            fs.writeFileSync(dataFilePath, JSON.stringify(records)); // almacena los registros en el archivo JSON
            res.writeHead(201);   // se manda código de estado 201 de que creo el registro
            res.end(JSON.stringify(newRecord));  // del nuevo registro en la respuesta end
        });
    } else if (req.method === "PUT" && parsedUrl.pathname.match(/\/materias\/\d+/)) {
        // en esta parte se actualia  un registro qur ya existe
        const id = parsedUrl.pathname.split('/')[2]; // toma posicion 3 del array que es el id
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedRecord = JSON.parse(body);
            const index = records.findIndex(r => r.id == id);//busca
            if (index !== -1) {
                records[index] = { ...records[index], ...updatedRecord }; //acualiza
                fs.writeFileSync(dataFilePath, JSON.stringify(records)); //graba
                res.writeHead(200);
                res.end(JSON.stringify(records[index])); //devuelve el registro que actualizo
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ message: "Registro no encontrado." }));
            }
        });
    } else if (req.method === "DELETE" && parsedUrl.pathname.match(/\/materias\/\d+/)) { //nos aseguramos de estar en el path correcto
        // borra un registro
        const id = parsedUrl.pathname.split('/')[2]; //se pone el lugar para tomar el indice
        const index = records.findIndex(r => r.id == id); //busca el id
        if (index !== -1) { //encontro el registro
            records.splice(index, 1); //elimina el registro del array
            fs.writeFileSync(dataFilePath, JSON.stringify(records)); //graba sin el dato
            res.writeHead(204); // avisa que se borro OK, pero no devuelve contenido en respuesta
            res.end();
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: "Registro no encontrado." }));
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Ruta no encontrada." }));
    }
});

// Escuchar en el puerto 3000
servidor.listen(5500, () => {
    console.log('Servidor escuchando en http://localhost:5500');
});
