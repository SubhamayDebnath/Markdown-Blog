import Setting from "../models/setting.model.js";
import Post from '../models/post.model.js'
import Category from '../models/category.model.js'

const homePage = async (req,res) => {
    try {
        const locals = {
            title: "Wonderink",
            description: "Welcome to our home page",
        };
        const setting = await Setting.findOne();
        const postLimit = setting.post.latestPostNumber || 6;
        const categoryLimit = setting.side.categoryNumber || 6;
        const posts = await Post.find({ isPublish: true }).sort({ createdAt: -1 }).limit(postLimit).populate('category', 'name');
        const categories = await Category.find({ isPublish: true }).sort({ createdAt: -1 }).limit(categoryLimit);
        res.render('home/index',{locals,user:req.user,posts,categories})
    } catch (error) {
        console.log(`Home page error : ${error}`);
        res.redirect('/error')
    }
}
const blogsPage=async (req,res) => {
    try {
        const locals = {
            title: "Wonderink - Blogs",
            description: "Welcome to our Blogs page",
        };
        const setting = await Setting.findOne();
        let perPage = setting.post.postNumber || 6;
        let page = req.query.page || 1;
        const posts = await Post.find({isPublish: true })
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
        const count = await Post.countDocuments({});
        const totalPages = Math.ceil(count / perPage);
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        const prevPage = page > 1 ? page - 1 : null;

        const categoryLimit = setting.side.categoryNumber || 6;
        const categories = await Category.find({ isPublish: true }).sort({ createdAt: -1 }).limit(categoryLimit);
        res.render('home/blogs',
        {
            locals,
            user:req.user,
            posts,
            categories,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            prevPage,
            totalPages,
        })
    } catch (error) {
        console.log(`Blogs page error : ${error}`);
        res.redirect('/error')
    }
}
const addLink = async (req,res) => {
    try {
        const postID=req.params.id;
        const post = await Post.findById(postID);
        if (!post) {
            return res.redirect('/')
        }
        post.likes += 1;
        await post.save();
        res.json({ success: true, likes: post.likes });
    } catch (error) {
        console.log(`Add Link error : ${error}`);
        res.redirect('/error')
    }
}

const categoriesPage = async (req,res) => {
    try {
        const locals = {
            title: "Wonderink - Categories",
            description: "Welcome to our Blogs page",
        };
        const categories = await Category.find({ isPublish: true }).sort({ createdAt: -1 });
        res.render('home/categories',{locals,user:req.user,categories})
    } catch (error) {
        console.log(`Categories page error : ${error}`);
        res.redirect('/error')
    }
}
const aboutPage = async (req,res) => {
    try {
        const locals = {
            title: "Wonderink - About",
            description: "Welcome to our Blogs page",
        };
        res.render('home/about',{locals,user:req.user})
    } catch (error) {
        console.log(`About page error : ${error}`);
        res.redirect('/error')
    }
}
const blogPage=async (req,res) => {
    try {
        const locals = {
            title: "Wonderink - Blog",
            description: "Welcome to our Blogs page",
        };
        const slug =req.params.slug;
        if(!slug){
            return res.redirect('/')
        }
        const post =  await Post.findOne({slug:slug}).populate("category", "name").populate('author','name avatar description socialLinks isSocialLinksVisible');
        const setting = await Setting.findOne();
        const categoryLimit = setting.side.categoryNumber || 6;
        const categories = await Category.find().sort({ createdAt: -1 }).limit(categoryLimit);
        if(!post){
            return res.redirect('/')
        }

        res.render('home/blog',{locals,user:req.user ,post,categories})
    } catch (error) {
        console.log(`Blog page error : ${error}`);
        res.redirect('/error')
    }
}
const errorPage=async (req,res) => {
    try {
        const locals = {
            title: "Wonderink - Error",
            description: "Welcome to our Error page",
        };
        res.status(500).render('error/500',{locals,user:req.user})
    } catch (error) {
        console.log(`Blog page error : ${error}`);
        res.redirect('/error')
    }
}


export{
    homePage,
    blogsPage,
    categoriesPage,
    aboutPage,
    blogPage,
    errorPage,
    addLink
}