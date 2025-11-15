const express = require('express');
const formidable = require('formidable');
const Jimp = require("jimp");
const app = express();

app.get('/', (req, res) => {
    res.send(`
    <h2>With <code>"express"</code> npm package</h2>
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
});

app.post('/api/upload', (req, res, next) => {
    const form = formidable({
        multiples: true,
        allowEmptyFiles: false,
        uploadDir: '../upload',
        keepExtensions: true,
        filename: (name, ext, a, b,) => {
            return `${name}.${ext}`;
        }
    });

    form.once('end', () => {
        console.log('Done!');
    });

    form.on('file', (formname, file) => {
        console.log('formname:', formname);
        //console.log('file:', file);

        Jimp.read(file.filepath, (err, lenna) => {
            if (err) throw err;
            lenna
                .resize(64, 64) // resize
                .quality(60) // set JPEG quality
                .greyscale() // set greyscale
                .write(`../upload/${file.newFilename}`); // save
        });
    });
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log('error');
            next(err);
            return;
        }
        console.log('success.');
        res.json({ fields, files });
    });
});

app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000 ...');
});
