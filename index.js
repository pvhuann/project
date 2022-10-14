const { request, response } = require("express");
const express = require("express");
const app = express();

app.use(express.json({ extended: false }));
app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views');

// app.use('/css', express.static(path.join(_dirname, 'node_modules/bootstrap/dist/css')))
// app.use('/js', express.static(path.join(_dirname, 'node_modules/bootstrap/dist/js')))
// app.use('/js', express.static(path.join(_dirname, 'node_modules/jquery/dist')))


// app.get('/', (request, response) => {
//     return response.render('index');
// });

app.listen(3000, () => {
    console.log("server is running on port 3000!");
})

const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIASMFZ4JSVD5RAZVEP',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
});

AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'danhSachMonHoc';
const multer = require('multer');
const upload = multer();



app.get('/', (request, response) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            response.send('Internal Server Error');
        } else {
            console.log('data= ', JSON.stringify(data));
            return response.render('index', { monHocs: data.Items });
        }
    });
});


app.post('/add', upload.fields([]), (request, response) => {
    const { ID, URL, tenMH, loaiMH, HK, Khoa } = request.body;
    console.log(request.body);
    const params = {
        TableName: tableName,
        Item: {
            "ID": +ID,
            "URL": URL,
            "tenMonHoc": tenMH,
            "loaiMonHoc": loaiMH,
            "hocKy": HK,
            "khoa": Khoa,
        }
    }

    console.log(params);
    docClient.put(params, (err, data) => {
        if (err) {
            return response.send('Internal Server Error');
        } else {

            return response.redirect("/");
        }
    })
});

app.post('/delete', upload.fields([]), (req, res) => {
    const Items = Object.keys(req.body);

    if (Items.length === 0) {
        return res.redirect('/')
    }
    console.log(Items);

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "ID": +Items[index]
            }
        }
        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send("error")
            } else {
                if (index > 0) {
                    onDeleteItem(index - 1)
                } else {
                    return res.redirect('/')
                }
            }
        })
    }

    onDeleteItem(Items.length - 1)
})