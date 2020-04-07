import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, validURL} from './util/util';
var fs = require('fs');

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  const mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
  };
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  
  app.get( "/filteredimage", async ( req: Request, res: Response ) => {
    const { image_url } = req.query;

    if ( !image_url ) {
      return res.status(400)
                .send(`No URL provided, please provide an url query parameter`);
    }
    if ( !validURL(image_url) ) {
      return res.status(422)
                .send(`Wrong URL provided, please validate url parameter`);
    }

    const filteredImage: Promise<string> = filterImageFromURL(image_url);
    filteredImage
      .then((image:string) => {
        const stream = fs.createReadStream(image);
        stream.on('open', function () {
            res.set('Content-Type', mime.jpg);
            stream.pipe(res);
        });
        stream.on('error', function () {
            res.set('Content-Type', 'text/plain');
            res.status(404).end('Not found');
        });
        image && deleteLocalFiles([image]);
      })
      .catch((e: Error) => res.status(500).send(`Something went wrong: ` + e.message));
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.status(404).send("try GET /filteredimage?image_url={{}}")
  } );
  
  // Monitoring Endpoint
  // Allows proper AWS monitoring
  app.get( "/health", async ( req: Request, res: Response ) => {
    res.status(200).send("Server Up & Running")
  } );

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();