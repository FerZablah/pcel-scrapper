//Damos nuestra palabra que hemos realizado esta actividad con integridad academica.

//HTML FORM CODE
const startFORM = `<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: whitesmoke;
        }

        * {
            box-sizing: border-box;
        }

        /* Add padding to containers */
        .container {
            padding: 16px;
            background-color: white;
        }

        /* Full-width input fields */
        input[type=text],
        input[type=password] {
            padding: 15px;
            margin: 5px 0 22px 0;
            border: none;
            background: #f1f1f1;
        }

        input[type=text]:focus,
        input[type=password]:focus {
            background-color: #ddd;
            outline: none;
        }

        /* Overwrite default styles of hr */
        hr {
            border: 1px solid #f1f1f1;
            margin-bottom: 25px;
        }

        /* Set a style for the submit button */
        .registerbtn {
            background-color: #4CAF50;
            color: white;
            padding: 16px 20px;
            margin: 8px 0;
            border: none;
            cursor: pointer;
            opacity: 0.9;
        }

        .registerbtn:hover {
            opacity: 1;
        }

        /* Add a blue text color to links */
        a {
            color: dodgerblue;
        }

        /* Set a grey background color and center the text of the "sign in" section */
        .signin {
            background-color: #f1f1f1;
            text-align: center;
        }
    </style>
</head>

<body>

    <form action="javascript:handleClick()">
        <div class="container">
            <h1>Mi buscador de PCEL</h1>
            <hr>

            <label for="palabra"><b>Producto a buscar (solamente una palabra)</b></label>
            <input type="text" pattern="[^\s]+" required="required" placeholder="computadora" id="palabra">
            <br>
            <label for="cantidad"><b>Cantidad de productos a mostrar</b></label>
            <input type="number" min="1" max="20" value="5" placeholder="1" id="cantidad">
            <br>
            <br>
            <label for="orden"><b>Orden</b></label>

            <input type="radio" checked="checked" id="asc" name="orden" value="ASC">
            <label for="male">Precio ascendente</label>
            <input type="radio" name="orden" id="desc" value="DESC">
            <label for="male">Precio descendente</label><br>
            <hr>
            <button type="submit" class="registerbtn">Buscar</button>
        </div>
    </form>
    <div>
        <p id="results">results</p>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.js">

    </script>
    <script>
        const handleClick = async () => {
            const palabra = document.getElementById("palabra").value;
            const cantidad = document.getElementById("cantidad").value;
            const asc = document.getElementById("asc").checked;
            
            axios.get(\`/search?palabra=\$\{palabra\}&cantidad=\$\{cantidad\}&order=\$\{asc ? "ASC" : "DESC"\}\`)
                .then(function (response) {
                    document.getElementById("results").innerHTML = response.data;
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    </script>
</body>
</html>`;

//HTML FORM CODE
const axios = require("axios");
const { JSDOM } = require("jsdom");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const chalk = require("chalk");
const port = process.env.PORT || 4000;;
const cors = require("cors");

const bodyParser = require("body-parser");
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://localhost:3001",
    "*"
  ];
  app.use(
    cors({
      origin: function(origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 || origin===null) {
          var msg =
            "The CORS policy for this site does not " +
            "allow access from the specified Origin.";
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      }
    })
  );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get("/", async (req, res, next) => {
    res.set('Content-Type', 'text/html');
    //res.sendFile(__dirname +"/searchForm.html");
    res.send(new Buffer(startFORM));
});
    
app.get("/search", async (req, res, next) => {
    res.set('Content-Type', 'text/html');
    console.log(req.query.cantidad);
    if(req.query.cantidad === '1'){
        axios.get(`https://pcel.com/index.php?route=product/search&filter_name=${req.query.palabra}&sort=p.price&order=${req.query.order}&limit=${req.query.cantidad}`)
        .then((response) => {
            return res.send(new Buffer(response.data));
        });
    }
    else{
        let str = "<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n<table border=1>\n";
        
        axios.get(`https://pcel.com/index.php?route=product/search&filter_name=${req.query.palabra}&sort=p.price&order=${req.query.order}&limit=${req.query.cantidad}`)
        .then((response) => {
            const {document} = (new JSDOM(response.data)).window;
            const tabla = document.getElementsByClassName("product-list")[0].children[0];
            str+="<tr>\n"
            for (let i = 0; i < tabla.rows.length; i+=2) {
                const image = tabla.rows[i].cells[0].children[0].children[0].children[0].src;
                const name = tabla.rows[i].cells[2].children[0].children[0].text;
                const link = tabla.rows[i].cells[2].children[0].children[0].href;
                let precio = 0;
                if(tabla.rows[i].cells[3].children[0].children.length > 1){
                    precio = tabla.rows[i].cells[3].children[0].children[0].innerHTML.replace(/<sup>/g, '').replace(/<\/sup>/g, '').replace(/(\r\n|\n|\r)/gm,"");
                }
                else {
                    precio = tabla.rows[i].cells[3].children[0].innerHTML.replace(/<sup>/g, '').replace(/<\/sup>/g, '').replace(/(\r\n|\n|\r)/gm,"");
                }
                str+=`<th><img src="${image}"/></th>\n`;
                str+=`<th>${precio}</th>\n`;
                str+=`<th><a href="${link}">${name}</a>\n</th>\n`;
                str+="</tr>\n";
            }
            str+="</table>\n</body>\n</html>";
            res.send(new Buffer(str));
            
        }).catch((err) => {
            console.log(err);
        });
    }
});

http.listen(port, () =>
    console.log(`WEB server running on Port: ${port}!`)
);