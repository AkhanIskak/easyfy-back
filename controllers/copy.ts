/*Skip to content
Search or jump to…
Pull requests
Issues
Marketplace
Explore

@AkhanIskak
AkhanIskak
/
StemWarriorHack
Public
Code
Issues
Pull requests
Actions
Projects
Wiki
Security
Insights
Settings
StemWarriorHack/index.js /
@Nurs-wd
Nurs-wd last changes
Latest commit a9dd140 on 3 Jan
History
2 contributors
@AkhanIskak@Nurs-wd
92 lines (83 sloc)  2.98 KB
*/

const dotenv = require('dotenv');
const util = require('./util')
const cookieParser = require('cookie-parser')
var cors = require('cors')
const mongoose = require('mongoose');
const Path = require('./models/Path');
dotenv.config({ path: "./configuration.env" });
const db = process.env.DATABASE.replace(
    "<password>",
    process.env.DATABASE_PASSWORD
);
mongoose
    .connect(db)
    .then(async () => {
        console.log("connected to database")
    });
const express = require('express');
const app = express();
app.use(cookieParser())
app.use(express.static('./public'))
app.use(express.json());
app.use(cors());
app.post('/path', async (req, res) => {
    console.log("works")
    let user;
    if (!req.cookies.user) {
        user = util.makeid(5) + Date.now();
        if (!req.body.contact || !req.body.description || !req.body.name || req.body.path.from.length === 1 || req.body.path.to.length === 1) {

            res.status(500).json({
                message: "error, fill all the gaps"
            })
            return;
        }
        // create path;
        try {

            let path = new Path({
                user: user, contact: req.body.contact, description: req.body.description, name: req.body.name,
                from: [req.body.path.from[0], req.body.path.from[1]],
                to: [req.body.path.to[0], req.body.path.to[1]]

            });

            let pathes = await Path.aggregate([{
                $geoNear: {
                    near: { coordinates: [req.body.path.from[0], req.body.path.from[1]] },
                    key: "from",
                    distanceField: "dist.calculated",
                    maxDistance: 200,
                    includeLocs: "dist.location",
                    spherical: true
                }
            }])
            await path.save();

            console.log(pathes)
            res.cookie('user', user)
            pathes.push([req.body.path.to[0],req.body.path.to[1],200]);
            res.status(200).json(pathes);
            //finding near pathes of other people;

        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "sorry something went wrong"
            })
            return
        }
    }

    let pathes = await Path.aggregate([{
        $geoNear: {
            near: { coordinates: [req.body.path.from[0], req.body.path.from[1]] },
            key: "from",
            distanceField: "dist.calculated",
            maxDistance: 200,
            includeLocs: "dist.location",
            spherical: true
        }
    }])
    pathes=pathes.filter(el=>el.user!==req.cookies.user)
    pathes.push([req.body.path.to[0],req.body.path.to[1],200]);
    await Path.findOneAndUpdate({ user: req.cookies.user }, {
        from: [req.body.path.from[0], req.body.path.from[1]],
        to: [req.body.path.to[0], req.body.path.to[1]]
    })
    res.status(200).json(pathes);
})

app.listen(process.env.PORT, () => console.log(`server is listening on port ${process.env.PORT}`));
