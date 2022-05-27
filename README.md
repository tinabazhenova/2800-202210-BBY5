# BBY-5 "Gen We"

## Our project

Our team BBY-5 is developing a mobile application “Gen We” to help people from different generations to get closer to each other and understand one another better with fun and engaging games.

## Technologies Used

Front-End: HTML5, CSS3, Google fonts, favicon
Back-End: JavaScript, node.js, express, heroku
Middleware: socket.io, multer
Database: mySQL2

## List of Files

C:.
|   .gcloudignore
|   .gitignore
|   .profile
|   app.yaml
|   create-tables.sql
|   Directory.txt
|   insert-rows.sql
|   package-lock.json
|   package.json
|   Procfile
|   README.md
|   server.js
|   
+---app
|   \---html
|           admin.html
|           crossit.html
|           guessit.html
|           index.html
|           main.html
|           matchit.html
|           profile.html
|           shop.html
|           template.html
|                   
\---public
    +---css
    |       admin.css
    |       crossit.css
    |       guessit.css
    |       index.css
    |       main.css
    |       matchit.css
    |       modal.css
    |       profile.css
    |       room.css
    |       shop.css
    |       template.css
    |       
    +---fonts
    |       atwriter.ttf
    |       comfortaa-variablefont_wght-webfont.eot
    |       comfortaa-variablefont_wght-webfont.ttf
    |       comfortaa-variablefont_wght-webfont.woff
    |       comfortaa-variablefont_wght-webfont.woff2
    |       Comfortaa-VariableFont_wght.ttf
    |       
    +---imgs
    |   |   dummy.jpg
    |   |   favicon.ico
    |   |   sk8erboi.jpg
    |   |   we1.png
    |   |   
    |   \---item
    |           item_image1.png
    |           item_image2.png
    |           item_image3.png
    |           item_image4.png
    |           
    \---js
            admin-dashboard.js
            crossit.js
            editProfile.js
            guessit.js
            index.js
            inventory.js
            main.js
            matchit.js
            room.js
            shop.js

## To work on our repo

To run or work on our app repo on your local divice yourself, you will need the followings downloaded. The order does not matter.
- JavaScript
- node.js
- mySQL

If you have downloaded all of above, open the folder on your command line. The first thing you need to do is populate the database that is required to run all the programs. Enter the following commands to open and populate data on your local mySQL.

1. mysql -u root -p
2. Hit enter for password
3. create database comp2800;
4. use comp2800
5. copy everything from create-tables.sql and paste it
6. copy everything from insert-rows.sql and paste it

After that, terminate mySQL (ctl + c) and type "node server". If you see the message that notifies the server is listening on port 8000, open your browser and go to "localhost:8000" to see the pages.

If you wish to work on our code, open the folder in your IDE (our team used VisualStudio Code). HTML files are in the "app" folder, CSSs and JavaScripts with all other resources in the "public" folder, as well as the server-side JavaScript on the root.

## How to use our app

Our goal with this app is closing the gap between generations with minigames that use generational terms. This instruction is on how to use our hosted app using the link: https://genwe-2.herokuapp.com/. 

You can create a room by clicking one of the three game options in the main menu - GuessIt, MatchIt, CrossIt Or, you can join an existing room that another user created by entering the room's room code (in this case you will need to ask them the code).

Games are playable online. In a room, users can send and receive chat messages. You earn points by playing games to the end. You can spend these points at the shop by purchasing upgrade coupons.

Coupons are used to upgrade your title on the profile page. Those titles are cosmetic achievements that are attached before your username whenever you send a chat message in a room.

Also on the profile page, you can upload your profile image or remove it and set it to default. You can see your user information on the table in the middle, and change your username and password by clicking them on the table.

## Contact Information

If you have discovered a bug, have a question or a suggestion, please contact us using the following information.

Tina: tinabazhenov@gmail.com
Gabriel: gabrielfair@hotmail.com
Raphael: raphael.yun@gmail.com
Sarvenaz: sarv.mr@gmail.com