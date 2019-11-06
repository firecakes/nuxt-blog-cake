<template>
    <div>
        <h1>
            Hello!
        </h1>

        <p>
            This is an example of a post you may use for reference. 
        </p>
        

        <p>
            If you want to remove this post from your blog, go to the post manager window (the url is /admin/post), and find the button associated with this post that will move it back to staging. Make sure that you have the following in the 
            <code>
                .env
            </code>
             file so that the page is accessible: 
            <code>
                ADMIN_ACCESS=true
            </code>
        </p>
        
        <p>
            Once a post is on staging, it will be in a directory called /pages/staging, where it will be safe to delete from your computer yourself. Do not ever delete posts that are in /pages/post! Move them to the staging directory first using the post manager only!
        </p>
    </div>
</template>