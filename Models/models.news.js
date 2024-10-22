const { Schema, mongoose, model } = require('mongoose');

let newsSchema = new Schema({
    Category: {
        type: String,
        required: { value: true, message: "News's Category is mandatory" },
        enum: ['Politics', 'Economy', 'World', 'Security', 'Law', 'Science', 'Society', 'Culture', 'Sports', 'Entertainment']
    },
    SubCategory: {
        type: String,
        required: { value: true, message: "News's Sub Category is mandatory" },
    },
    Heading: {
        type: String,
        required: { value: true, message: "News's Heading is mandatory" },
    },
    Summary: {
        type: String,
        required: { value: true, message: "Summary is mandatory" },
    },
    SubEditor: {
        type: String,
        required: { value: true, message: "Reporter name is mandatory" }
    },
    PublishedDateAndTime: {
        type: Date,
        default: Date.now
    },
    EditedDateAndTime: {
        type: Date
    },
    Image: {
        type: String,
        required: { value: true, message: "Image is mandatory" }
    },
    Location: {
        type: String,
        // required:{value:true, message:"Location is mandatory"}
    },
    Content: {
        type: Array,
        required: { value: true, message: "Content is mandatory" }
    },
    newsStatus: {
        type: String,
        enum: ['Breaking', "EditorPick", 'TopTen', 'Normal'],
        default: 'Normal'
    },
    editedNews: {
        type: Boolean,
        default: false,
        required: { value: true, message: "Specifying edited or not is mandatory" }
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: { value: true, message: "Specifying deleted or not is mandatory" }
    }
})

module.exports = model('news', newsSchema)