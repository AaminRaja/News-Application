let news = require('../Models/models.news')

let addNews = async (req, res, next) => {
    console.log('Add news hits');
    try {
        let { userRole } = req.user
        if (userRole === 'Editor') {
            let { Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, newsStatus } = req.body
            console.log(Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, newsStatus);

            if (!(Category && SubCategory && Heading && Summary && SubEditor && Image && Content.length)) {
                return res.status(400).json({ error: true, message: "Send Category, SubCategory, Heading, SubEditor, Summary, Image and Content to backend" })
            }

            let newNews = await news.create({ Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, newsStatus });
            // newNews.Content = newNews.Content.slice(0, 10)
            // console.log(newNews);

            return res.status(200).json({ error: false, message: "New News added Successfully", news: newNews })
        } else {
            return res.status(401).json({ error: true, message: "This user is not authorized to access This request" })
        }
    } catch (error) {
        next(error)
    }
}

let editNews = async (req, res, next) => {
    console.log("Editing a news");
    try {
        let { userRole } = req.user
        if (userRole === 'Editor') {
            let { id } = req.params

            let { Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, newsStatus } = req.body

            console.log(Category);
            if (!(Category && SubCategory && Heading && Summary && SubEditor && Image && Content.length)) {
                return res.status(400).json({ error: true, message: "Send Category, SubCategory, Heading, SubEditor, Summary, Image and Content to backend" })
            }

            let newsToBeUpdate = await news.findByIdAndUpdate(id)

            if (newsToBeUpdate) {
                let EditedDateAndTime = Date.now()
                console.log(`EditedDateAndTime : ${EditedDateAndTime}`);
                let editedNews = await news.updateOne({ _id: id }, { Category, SubCategory, Heading, Summary, SubEditor, Image, Location, Content, EditedDateAndTime, newsStatus, editedNew: true }, { new: true })
                return res.status(200).json({ error: false, message: "News data updated Succeessfully", news: editedNews })
            } else {
                return res.status(404).json({ error: true, message: "there is no news with this newsId" }) //Not found
            }
        } else {
            return res.status(401).json({ error: true, message: "This user is not authorized to access This request" })
        }
    } catch (error) {
        next(error)
    }
}

let softDeleteOneNews = async (req, res, next) => {
    console.log('Soft Deleting single news');
    try {
        let { userRole } = req.user
        let { deleteOrNot } = req.body
        console.log(userRole);
        if (userRole === 'Editor') {
            let { id } = req.params
            let newsToBeSoftDelete = await news.findOne({ _id: id })
            if (newsToBeSoftDelete) {
                let softDeletedNews = await news.updateOne({ _id: id }, { isDeleted: deleteOrNot })
                console.log(softDeletedNews);
                return res.status(200).json({ error: false, message: "isDeleted update successfully" })
            } else {
                return res.status(404).json({ error: true, message: "No news in database for this id" })
            }
        } else {
            return res.status(401).json({ error: true, message: "This user is not authorized to access This request" })
        }
    } catch (error) {
        next(error)
    }
}

let deleteOneNews = async (req, res, next) => {
    console.log('Deleting single news');
    try {
        let { userRole } = req.user
        if (userRole === 'Editor') {
            let { id } = req.params
            let newsToBeDelete = await news.findOne({ _id: id })
            if (newsToBeDelete) {
                let deletedNews = await news.findByIdAndDelete(id)
                return res.status(200).json({ error: false, message: "News deleted successfully" })
            } else {
                return res.status(404).json({ error: true, message: "No news in database for this id" })
            }
        } else {
            return res.status(401).json({ error: true, message: "This user is not authorized to access This request" })
        }
    } catch (error) {
        next(error)
    }
}

let fetchAllNews = async (req, res, next) => {
    // console.log(req);
    console.log('trying to fetch all newses');

    try {
        let { currentPageNumber, newsPerPage, numberOfNews } = req.query
        console.log(currentPageNumber, newsPerPage);

        if (currentPageNumber && newsPerPage) {
            currentPageNumber = parseInt(currentPageNumber) || 1
            newsPerPage = parseInt(newsPerPage) || 9
            let skip = (currentPageNumber - 1) * newsPerPage

            // let allNews = await news.find().skip(skip).limit(newsNumberInPage)
            let allNews = await news.aggregate([
                { $match: { isDeleted: false } },
                { $sort: { _id: -1 } },
                { $skip: skip },
                { $limit: newsPerPage }
            ])
            let totalNewsCount = await news.countDocuments({ isDeleted: false })

            let totalNumberOfPages = Math.ceil(totalNewsCount / newsPerPage)

            if (allNews.length) {
                return res.status(200).json({ error: false, message: "Sending all newses", allNews, totalNumberOfPages, currentPageNumber })
            } else {
                return res.json({ error: true, message: "there is no news" })
            }
        } else if (numberOfNews) {
            numberOfNews = parseInt(numberOfNews)

            let allNews = await news.aggregate([
                { $match: { isDeleted: false } },
                { $sort: { _id: -1 } },
                { $limit: numberOfNews }
            ])

            if (allNews.length) {
                return res.status(200).json({ error: false, message: "Sending all newses", allNews })
            } else {
                return res.json({ error: true, message: "there is no news" })
            }
        }

        // currentPageNumber = parseInt(currentPageNumber) || 1
        // newsPerPage = parseInt(newsPerPage) || 9
        // let skip = (currentPageNumber - 1) * newsPerPage

        // // let allNews = await news.find().skip(skip).limit(newsNumberInPage)
        // let allNews = await news.aggregate([
        //     { $sort: { _id: -1 } },
        //     { $skip: skip },
        //     { $limit: newsPerPage }
        // ])
        // let totalNewsCount = await news.countDocuments()

        // let totalNumberOfPages = Math.ceil(totalNewsCount / newsPerPage)

        // if (allNews.length) {
        //     res.status(200).json({ error: false, message: "Sending all newses", allNews, totalNumberOfPages, currentPageNumber })
        // } else {
        //     res.json({ error: true, message: "there is no news" })
        // }
    } catch (error) {
        // console.log(error);
        next(error);
    }
}

let filterByCategory = async (req, res, next) => {
    console.log("Filtering by category");
    try {
        // let { Category } = req.body
        // console.log(`Category from from frontend : ${Category}`);

        let { category, currentPageNumber, newsPerPage, numberOfNews } = req.query
        console.log(`category in backend : ${category}`);

        // console.log(typeof numberOfNews);

        if (numberOfNews) {
            let filteredNewsByCategory = await news.find({ Category: category, isDeleted: false }).sort({ _id: -1 }).limit(numberOfNews)
            if (filterByCategory.length) {
                return res.status(200).json({ error: false, message: "Newses filtered by Category", filteredNewsByCategory })
            } else {
                return res.json({ error: true, message: "There is no news in this category" })
            }

        } else if (currentPageNumber && newsPerPage) {
            console.log("Enter second");

            currentPageNumber = parseInt(currentPageNumber) || 1
            newsPerPage = parseInt(newsPerPage) || 9
            let skip = (currentPageNumber - 1) * newsPerPage

            console.log(currentPageNumber, newsPerPage);

            let filteredNewsByCategory = await news.find({ Category: category, isDeleted: false }).sort({ _id: -1 }).skip(skip).limit(newsPerPage)

            console.log(filteredNewsByCategory.length);

            let totalNumberOfCategoryNews = await news.countDocuments({ Category: category, isDeleted: false })
            console.log(totalNumberOfCategoryNews);

            let totalNumberOfPages = Math.ceil(totalNumberOfCategoryNews / newsPerPage) //! mistake(has to find all number of editor's pick, then find the totoal number of pages)
            console.log(totalNumberOfPages);

            if (filterByCategory.length) {
                return res.status(200).json({ error: false, message: "Newses filtered by Category", filteredNewsByCategory, totalNumberOfPages })
            } else {
                return res.json({ error: true, message: "There is no news in this category" })
            }
        }

        // let filteredNewsByCategory = await news.find({ Category: category })
        // // console.log(filteredNewsByCategory);
        // if (filteredNewsByCategory.length) {
        //     return res.status(200).json({ error: false, message: "Newses filtered by Category", filteredNewsByCategory })
        // } else {
        //     return res.json({ error: true, message: "There is no news in this category" })
        // }
    } catch (error) {
        next(error)
    }
}

let filterBySubEditor = async (req, res, next) => {
    console.log('Filtering by sub editor');
    try {
        let { SubEditor } = req.body
        let filteredNewsBySubEditor = await news.find({ SubEditor: SubEditor, isDeleted: false })
        console.log(filterBySubEditor);
        if (filterBySubEditor.length) {
            return res.status(200).json({ error: false, message: "Newses filtered by SubEditor", filteredNewsBySubEditor })
        } else {
            return res.json({ error: true, message: "There is no news for this subeditor" })
        }
    } catch (error) {
        next(error)
    }
}

let fetchSingleNews = async (req, res, next) => {
    console.log('Fetching single news');
    try {
        let { id } = req.params
        let singleNews = await news.findOne({ _id: id })
        console.log(singleNews);

        if (singleNews) {
            return res.status(200).json({ error: false, message: "Single news by id fetched", singleNews })
        } else {
            return res.json({ error: true, message: "No news with this ID" })
        }
    } catch (error) {
        next(error)
    }
}

let fetchBreakingNewses = async (req, res, next) => {
    console.log('Fetching breaking news');
    try {
        let { currentPageNumber, newsPerPage } = req.query
        console.log(currentPageNumber, newsPerPage);
        if (newsPerPage && currentPageNumber) {
            currentPageNumber = parseInt(currentPageNumber) || 1
            newsPerPage = parseInt(newsPerPage) || 9
            let skip = (currentPageNumber - 1) * newsPerPage

            let breakingNewses = await news.find({ newsStatus: "Breaking", isDeleted: false }).sort({ _id: -1 }).skip(skip).limit(newsPerPage);

            let totalNumberOfbreakingNews = await news.countDocuments({ newsStatus: "Breaking", isDeleted: false })
            // console.log(totalNumberOfEditorsPick);

            let totalNumberOfPages = Math.ceil(totalNumberOfbreakingNews / newsPerPage)

            if (breakingNewses.length) {
                return res.status(200).json({ error: false, message: "Breaking Newses Fteched", breakingNewses, totalNumberOfPages })
            } else {
                return res.json({ error: true, message: "There is no breaking newses" })
            }
        } else {
            let breakingNewses = await news.find({ newsStatus: 'Breaking', isDeleted: false }).sort({ _id: -1 }).limit(1)

            if (breakingNewses.length) {
                return res.status(200).json({ error: false, message: "Breaking Newses Fteched", breakingNewses })
            } else {
                return res.json({ error: true, message: "There is no breaking newses" })
            }
        }

    } catch (error) {
        next(error)
    }
}

let fetchTopTenNewses = async (req, res, next) => {
    console.log('Fetching topten news');
    try {
        let { numberOfNews, currentPageNumber, newsPerPage } = req.query
        console.log(numberOfNews, currentPageNumber, newsPerPage);
        if (numberOfNews) {
            console.log("Enter first");
            let topTenNewses = await news.find({ newsStatus: { $in: ['Breaking', 'TopTen'] }, isDeleted: false }).sort({ _id: -1 }).limit(numberOfNews)
            let firstInTopTen = topTenNewses[0]
            let restInTopTen = topTenNewses.slice(1)
            if (topTenNewses.length) {
                return res.status(200).json({ error: false, message: "Topten Newses Fteched", firstInTopTen, restInTopTen })
            } else {
                return res.json({ error: true, message: "There is no topTen newses" })
            }
        } else if (currentPageNumber, newsPerPage) {
            console.log("Enter second");

            currentPageNumber = parseInt(currentPageNumber) || 1
            newsPerPage = parseInt(newsPerPage) || 9
            let skip = (currentPageNumber - 1) * newsPerPage

            let topTenNewses = await news.find({ newsStatus: "TopTen", isDeleted: false }).sort({ _id: -1 }).skip(skip).limit(newsPerPage);

            let totalNumberOfTopTenNews = await news.countDocuments({ newsStatus: "TopTen", isDeleted: false })

            let totalNumberOfPages = Math.ceil(totalNumberOfTopTenNews / newsPerPage)

            if (topTenNewses.length) {
                return res.status(200).json({ error: false, message: "Breaking Newses Fteched", topTenNewses, totalNumberOfPages })
            } else {
                return res.json({ error: true, message: "There is no breaking newses" })
            }
        }

    } catch (error) {
        next(error)
    }
}

let fetchEditorPick = async (req, res, next) => {
    console.log('Fetching editor pick');
    try {
        let { numberOfNews, currentPageNumber, newsPerPage } = req.query
        console.log(currentPageNumber, newsPerPage);

        if (numberOfNews) {
            numberOfNews = parseInt(numberOfNews) || 3
            // console.log(numberOfNews);
            let editorPickNewses = await news.find({ newsStatus: "EditorPick", isDeleted: false }).sort({ _id: -1 }).limit(numberOfNews)

            if (editorPickNewses.length) {
                return res.status(200).json({ error: false, message: "EditorPick Newses Fteched", editorPickNewses })
            } else {
                return res.json({ error: true, message: "There is no editor pick newses" })
            }
        } else if (currentPageNumber && newsPerPage) {
            console.log(currentPageNumber, newsPerPage);

            currentPageNumber = parseInt(currentPageNumber) || 1
            newsPerPage = parseInt(newsPerPage) || 9
            let skip = (currentPageNumber - 1) * newsPerPage

            console.log(currentPageNumber, newsPerPage);

            let editorPickNewses = await news.find({ newsStatus: "EditorPick", isDeleted: false }).sort({ _id: -1 }).skip(skip).limit(newsPerPage);

            let totalNumberOfEditorsPick = await news.countDocuments({ newsStatus: "EditorPick", isDeleted: false })
            console.log(totalNumberOfEditorsPick);

            let totalNumberOfPages = Math.ceil(totalNumberOfEditorsPick / newsPerPage)

            console.log(`totalNumberOfPages : ${totalNumberOfPages}`);

            if (editorPickNewses.length) {
                return res.status(200).json({ error: false, message: "EditorPick Newses Fteched", editorPickNewses, totalNumberOfPages })
            } else {
                return res.json({ error: true, message: "There is no editor pick newses" })
            }
        }
    } catch (error) {
        next(error)
    }
}

let fetchDeletedNews = async (req, res, next) => {
    try {
        let { userRole } = req.user
        if (userRole === "Editor") {
            let { currentPageNumber, newsPerPage } = req.query
            console.log(currentPageNumber, newsPerPage);

            if (currentPageNumber && newsPerPage) {
                currentPageNumber = parseInt(currentPageNumber) || 1
                newsPerPage = parseInt(newsPerPage) || 9
                let skip = (currentPageNumber - 1) * newsPerPage

                let deletedNews = await news.find({ isDeleted: true }).sort({ _id: -1 }).skip(skip).limit(newsPerPage);

                let totalNumberOfDeletedNews = await news.countDocuments({ isDeleted: true })

                let totalNumberOfPages = Math.ceil(totalNumberOfDeletedNews / newsPerPage)

                if (deletedNews.length) {
                    return res.status(200).json({ error: true, message: "Fetching details of all deleted news", deletedNews, totalNumberOfPages })
                } else {
                    return res.json({ error: true, message: "There is no deleted newses" })
                }
            }
        } else {
            return res.status().json({ error: true, message: "This user is not authorized to access This request" })
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    addNews,
    editNews,
    deleteOneNews,
    fetchAllNews,
    filterByCategory,
    filterBySubEditor,
    fetchSingleNews,
    fetchBreakingNewses,
    fetchTopTenNewses,
    fetchEditorPick,
    fetchDeletedNews,
    softDeleteOneNews
}