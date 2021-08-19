const express = require('express');
const axios = require('axios');
const fs = require("fs");
const app = express();
const port = 3000;

const latestPreVersion = 'pre-0.2';

app.get('/', (req, res) => {
  var back = {
    "Status": "OK",
    "Runtime-Mode": "Development",
    "Application-Author": "G_RCraft",
    "Application-Description":"G_Rcraft Public API.",
    "version": "1.0",
    "Application-Owner": "G_Rcraft"
  };
  res.send(back)
});

app.get('/version/latest/pre', (req, res) => {

  var response = {
    status: 200,
    version: latestPreVersion,
    changelog: "https://discord.com/channels/877241869522858014/877251064976527450/877950676813107210"
  }

  res.send(response);

});

app.get('/version/download/:version', (req, res) => {
  res.redirect(`https://github.com/GersomR-afk/G_Rcraft_API/releases/download/${req.params.version}/${req.params.version}.zip`)
});

app.get('/hat/:username', (req, res) => {
  var username = req.params.username;
  var uuid = "";
  // Get the UUID from the Mojang API
  axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
  .then(function (response) {

    // handle success
    if(response.status == 200) {
      uuid = response.data.id;
      console.log(`Checking UUID of: ${uuid}`);
      // API stuff happening here
      var path = `${__dirname}/assets/hats/${uuid}.png`;
      if(fs.existsSync(path)) {
        console.log(path);
        res.sendFile(path);
        res.status(200);
      }else {
        console.log("Couldn't find matching cape, cancelling request.");
        res.status(404);
        res.end();
      }
    }else {
      res.status(response.status);
      res.end();
    }

  });
});

app.get('/cape/:username', (req,res) => {
  var username = req.params.username;
  var uuid = "";
  // Get the UUID from the Mojang API
  axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`)
  .then(function (response) {
    // handle success
    if(response.status == 200) {
      uuid = response.data.id;
      console.log(`Checking UUID of: ${uuid}`);
      // API stuff happening here
      var path = `${__dirname}/assets/capes/${uuid}.png`;
      if(fs.existsSync(path)) {
        res.sendFile(path);
      }else {
        console.log("Couldn't find matching cape, checking with Mojang.");
        axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
        .then(function(response) {
          if(response.status == 200) {
            var textures = JSON.parse(Buffer.from(response.data.properties[0].value, 'base64').toString('utf-8'));
            try {
              var cape = textures.textures.CAPE.url;
            }catch(e) {
              console.log("Couldn't find matching cape, redirecting to Optifine instead.");
              var url = "http://s.optifine.net/capes/" + username + ".png";
              res.redirect(url).end(301);
            }
            if(cape != null) {
              console.log("Cape found! Redirecting...");
              res.redirect(cape).end(301);
            }else {
              console.log("Couldn't find matching cape, redirecting to Optifine instead.");
              var url = "http://s.optifine.net/capes/" + username + ".png";
              res.redirect(url).end(301);
            }
          }
        });
      }
    }else {
      res.status(response.status);
      res.end();
    }
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  });
});

app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));