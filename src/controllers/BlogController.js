const AuthorModel = require("../models/authorModel");
const moment = require("moment")
const BlogModel = require("../models/blogModel");
const mongoose = require("mongoose");


// 1st
//------------------------------------- create Blog------------------------------


const createBlogs = async function (req, res) {
    try {
        let data = req.body
        const { title, body, authorId, category } = data

        if (Object.keys(data).length != 0) {
            if (data.title === undefined || data.tags === undefined || data.category === undefined || data.authorId === undefined
                || data.subcategory === undefined || data.body === undefined) {
                return res.status(400).send({ status: false, msg: "Mandatory field missing !!" })
            }

            if (Object.values(title).length <= 0) {
                return res.status(400).send("Blog TITLE MISSING!!");
            }
            if (Object.values(body).length <= 0) {
                return res.status(400).send("Blog BODY MISSING!!");
            }
            if (Object.values(category).length <= 0) {
                return res.status(400).send(" Blog CATERGORY MISSING!!");
            }
            if (Object.values(authorId).length <= 0) {
                return res.status(400).send("AthorId MISSING!!");
            }
            let authorid = await AuthorModel.findById(data.authorId);
            if (!authorid) {
                return res.status(400).send({ status: false, msg: " AuthorId is required or not valid" });
            }

            if (data.isPublished == true) {
                req.body.publishedAt = Date.now();

                let createblogs = await BlogModel.create(data);

                res.status(201).send({ status: true, data: createblogs });
            }
        } else {
            return res.status(400).send({ status: false, msg: "plese provide blog details" })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};
module.exports.createBlogs = createBlogs;


// 2nd
const getBlogs = async function (req, res) {
    try {
        let data = req.query
        // find the all data filter and query
        let blogs = await BlogModel.find({ $and: [{ isDeleted: false }, { isPublished: true }, data] });

        // check data exits or not
        if (blogs.length <= 0) {
            return res.status(400).send({ status: false, msg: 'Data Not Found' })
        }
        return res.status(200).send({ status: true, data: blogs })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getBlogs = getBlogs;
  

// const getBlogs = async function (req, res) {
//     try { 
//         const filterQuery = {isDeleted: false, deletedAt: null, isPublished: true}
//         const queryParams = req.query

//         if(isValidRequestBody(queryParams)){
//             const {authorId, category, tags, subcategory} = queryParams

//             if(isValid(authorId) && isValidObjectId(authorId)){
//                 filterQuery['authorId'] = authorId
//             }
//             if(isValid(category)){
//                 filterQuery['category'] = category.trim()
//             }
//             if(isValid(tags)){
//                 const tagsArr = tags.trim().split(',').map(tag => tag.trim());
//                 filterQuery['tags'] = {$all:tagsArr}
//             }
//             if(isValid(subcategory)){
//                 const subcatergoryArr = subcategory.trim().split(',').map(tag => tag.trim());
//                 filterQuery['subcategory'] = {$all: subcatergoryArr}
//             }

//         }
//         const blogs = await BlogModel.find(filterQuery)

//         if(Array.isArray(blogs) && blogs.length ===0){
//             res.status(404).send({status:false, msg: 'No blogs found'})
//             return
//         }
//                res.status(200).send({status:true,data:blogs})
//     }
//     catch (err) {
//         console.log(err.message)
//         res.status(500).send({ status: false, msg: err.message })
//     }
// }
// module.exports.getBlogs = getBlogs;




const updateBlogs = async function (req, res) {
    try {
        let Id = req.params.blogId;
        let PostData = req.body;

        let { body, title, tags, subcategory, isPublished, isDeleted } = PostData

        if (Id.length < 24) {
            return res.status(404).send({ status: false, msg: "Enter Valid Blog-Id" });
        }
        let user = await BlogModel.findById(Id)
        if (!user) {
            return res.status(404).send({ staus: false, msg: "No such blog exists" });
        }

        let updateBlog1 = await BlogModel.findByIdAndUpdate({ _id: Id }, {
            $set: { body: body, title: title, isPublished: isPublished, isDeleted: isDeleted },
            $push: { tags: tags, subcategory: subcategory }
        }, { new: true })

        if (updateBlog1.isPublished == true) {

            let updatedData = await BlogModel.findOneAndUpdate({ _id: Id }, { publishedAt: new String(Date()) }, { new: true });
        }
        if (updateBlog1.isPublished == false) {
            let updatedData = await BlogModel.findOneAndUpdate({ _id: Id }, { publishedAt: null });;
        }
        if (updateBlog1.isDeleted == true) {
            let updatedData = await BlogModel.findOneAndUpdate({ _id: Id }, { deletedAt: new String(Date()) }, { new: true });
        }
        if (updateBlog1.isDeleted == false) {
            let updatedData = await BlogModel.findOneAndUpdate({ _id: Id }, { deletedAt: null });
        }

        return res.status(201).send({ status: true, data: updateBlog1 });
    }
    catch (err) {
        return res.status(500).send({ msg: err.message });
    }
};
module.exports.updateBlogs = updateBlogs

// 4th

const validateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId
        let validateblogId = await BlogModel.findOne({ _id: blogId, isDeleted: false })

        if (!validateblogId) {
            return res.status(404).send({ status: false, msg: "BlogId does not exist." })
        }
        let updatedBlog = await BlogModel.findByIdAndUpdate({ _id: blogId },
            { $set: { isDeleted: true } }, { deletedAt: Date.now() })
        res.status(200).send({ status: true, msg: "Successfully updated." })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
};
module.exports.validateBlog = validateBlog;

// 5th
const deleteBlogsByQuery = async function (req, res) {
    try {
        let data = req.query;
        // add a query variable and add a default key value [ isDeleted: false ]
        let query = { isDeleted: false };

        if (Object.keys(data).length == 0) {
            //-> if data undefined
            return res.status(400).send({
                status: false,
                msg: "no query params available "
            });
        } else {
            //-> if tags defined
            if (data.tags) { data.tags = { $in: data.tags }; }

            //-> if subcategory defined
            if (data.subcategory) { data.subcategory = { $in: data.subcategory };  }

            // create a query structure in [ query.$or = ... }
            query["$or"] = [{ authorId: data.authorId }, { tags: data.tags }, { category: data.category }, { subcategory: data.subcategory }];
        }

        // console.log(query)
        // check if the query related data exist OR not
        const available = await BlogModel.find(query).count();
        if (available == 0) {
            return res.status(404).send({ status: false, msg: "query data not found" });
        }

        // perform delete here using update many 
        const deleteData = await BlogModel.updateMany(query, { $set: { isDeleted: true } });
        res.status(200).send({ status: true, data: deleteData });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};
module.exports.deleteBlogsByQuery = deleteBlogsByQuery;

 