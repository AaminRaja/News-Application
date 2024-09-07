let news = require('../Models/models.news')

let addNews = async(req, res, next) => {
    console.log('Add news hits');
    try {
        // let {userRole} = req.user
        // if(userRole === 'Editor'){
            let {Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, newsStatus} = req.body
            if(!(Category && SubCategory && Heading && Summary && SubEditor && Image && Content)){
                return res.status(400).json({error:true, message:"Send Category, SubCategory, Heading, SubEditor, Image and Content to backend"})
            }

            let newNews = await news.create({Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, newsStatus});
            newNews.Content = newNews.Content.slice(0, 10)
            console.log(newNews);

            res.status(200).json({error:false, message:"New News added Successfully", news:newNews})
        // }else{
        //     res.status().json({error:true, message:"This user is not authorized to access This request"})
        // }  
    } catch (error) {
        next(error)
    }
}

let editNews = async(req, res, next) => {
    try {
        let {userRole} = req.user
        if(userRole === 'Editor'){
            let {id} = req.params
            let {Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, newsStatus} = req.body
            if(!(Category && SubCategory && Heading && Summary && SubEditor && Image && Location && Content)){
                return res.status(400).json({error:true, message:"Send Category, SubCategory, SubCategory, Heading, SubEditor, Image, Location and Content to backend"})
            }

            let newsToBeUpdate = await news.findByIdAndUpdate(id)

            if(newsToBeUpdate){
                let EditedDateAndTime = Date.now()
                console.log(`EditedDateAndTime : ${EditedDateAndTime}`);
                let editedNews = await news.updateOne({_id:id}, {Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, EditedDateAndTime, newsStatus}, {new:true})
                res.status(200).json({error:false, message:"News data updated Succeessfully", news:editedNews})
            }else{
                return res.status(404).json({error:true, message:"there is no news with this newsId"}) //Not found
            }
        }else{
            res.status().json({error:true, message:"This user is not authorized to access This request"})
        }
    } catch (error) {
        next(error)
    }
}

let deleteOneNews = async(req, res, next) => {
    try {
        let {userRole} = req.user
        if(userRole === 'Editor'){
            let {id} = req.params
            let newsToBeDelete = await news.findOne({_id:id})
            if(newsToBeDelete){
                let deletedNews = await news.findByIdAndDelete(id)
                res.status(200).json({error:true, message:"News deleted successfully"})
            }else{
                res.status(404).json({error:true, message:"No news in database for this id"})
            }
        }else{
            res.status().json({error:true, message:"This user is not authorized to access This request"})
        }
    } catch (error) {
        next(error)
    }
}

let fetchAllNews = async(req, res, next) => {
    console.log(req);
    
    console.log('trying to fetch all newses');
    
    try {
        let allNews = await news.find()
        console.log(allNews);
        if(allNews.length){
            res.status(200).json({error:false, message:"Sending all newses", allNews})
        }else{
            res.json({error:true, message:"there is no news"})
        }
    } catch (error) {
        next(error)
    }
}

let filterByCategory = async(req, res, next) =>{
    try {
        let {Category} = req.body
        console.log(`Category from from frontend : ${Category}`);
        let filteredNewsByCategory = await news.find({Category:Category})
        console.log(filteredNewsByCategory);
        if(filteredNewsByCategory.length){
            res.status(200).json({error:false, message:"Newses filtered by Category", filteredNewsByCategory})
        }else{
            res.json({error:true, message:"There is no news in this category"})
        }
    } catch (error) {
        next(error)
    }
}

let filterBySubEditor = async(req, res, next) =>{
    try {
        let {SubEditor} = req.body
        let filteredNewsBySubEditor = await news.find({SubEditor:SubEditor})
        console.log(filterBySubEditor);
        if(filterBySubEditor.length){
            res.status(200).json({error:false, message:"Newses filtered by SubEditor", filteredNewsBySubEditor})
        }else{
            res.json({error:true, message:"There is no news for this subeditor"})
        }
    } catch (error) {
        next(error)
    }
}

let fetchSingleNews = async(req, res, next) => {
    try {
        let {id} = req.params
        let singleNews = await news.findOne({_id:id})
        console.log(singleNews);

        if(singleNews){
            res.status(200).json({error:false, message:"Single news by id fetched", singleNews})
        }else{
            res.json({error:true, message:"No news with this ID"})
        }
    } catch (error) {
        next(error)
    }
}

let fetchBreakingNewses = async(req, res, next) => {
    try {
        let breakingNewses = await news.find({newsStatus:'Breaking'})
        console.log(breakingNewses);
        if(breakingNewses.length){
            res.status(200).json({error:false, message:"Breaking Newses Fteched", breakingNewses})
        }else{
            res.json({error:true, message:"There is no breaking newses"})
        }
    } catch (error) {
        next(error)
    }
}

let fetchTopTenNewses = async(req, res, next) => {
    try {
        let topTenNewses = await news.find({newsStatus:{$in: ['Breaking', 'TopTen']}})
        console.log(topTenNewses);
        if(topTenNewses.length){
            res.status(200).json({error:false, message:"Topten Newses Fteched", topTenNewses})
        }else{
            res.json({error:true, message:"There is no topTen newses"})
        }
    } catch (error) {
        next(error)
    }
}

let fetchEditorPick = async(req, res, next) => {
    try {
        let editorPickNewses = await news.find({newsStatus:{$in: ['Breaking', "EditorPick"]}})
        console.log(editorPickNewses);
        if(editorPickNewses.length){
            res.status(200).json({error:false, message:"EditorPick Newses Fteched", editorPickNewses})
        }else{
            res.json({error:true, message:"There is no editor pick newses"})
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {addNews, editNews, deleteOneNews, fetchAllNews, filterByCategory, filterBySubEditor, fetchSingleNews, fetchBreakingNewses, fetchTopTenNewses, fetchEditorPick}