import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout/AppLayout";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb/lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { getAppProps } from "../../utils/getAppProps";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Post(props) {

  console.log("PROPS:" , props);
  const router = useRouter();
  const[showDeleteConfirm,setShowDeleteConfirm]=useState(false);

  const handleConfirmDelete = async ()=>{
    try{
      const response = await fetch("/api/deletePost",{
        method : "POST",
        headers :{
          "content-type" : "application/json"
        } ,
        body : JSON.stringify({postId : props.id})
      })
      const json = await response.json();
      if(json.success){
        router.replace("/post/new")
      }

    }catch(e){

    }
  }

  return (
    <div className="overflow-auto h-full">
      <div className="max-w-screen-sm mx-auto">
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          SEO title and meta description
        </div>
        <div className="p-4 my-2 border border-stone-200 rounded-md">
          <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
          <div className="mt-2">{props.metaDescription}</div>
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Keywords
        </div>
        <div className="flex flex-wrap pt-2 gap-1">
          {props.keywords.split(",").map((keyword, i) => (
            <div key={i} className="p-2 rounded-full bg-slate-800 text-white">
              <FontAwesomeIcon icon={faHashtag} /> {keyword}
            </div>
          ))}
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Blog Post
        </div>
        <div dangerouslySetInnerHTML={{ __html: props.postContent || "" }} />
        <div className="my-4">
          {!showDeleteConfirm && (
            <button
              className="btn bg-red-600 hover:bg-red-700"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete post
            </button>
          )}
          {!!showDeleteConfirm && (
            <div>
              <p className="p-2 bg-red-300 text-center">
                Are you sure you want to delete this post? This action is
                irreversible.
              </p>
              <div className="grid grid-cols-2">
                <button
                  className="btn bg-stone-600 hover:bg-stone-700 gap-2"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  cancel
                </button>
                <button className="btn bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>
                  confirm delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

 Post.getLayout = function getLayout(page, pageProps) {
   return <AppLayout {...pageProps}>{page}</AppLayout>;
 };

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx){
     const props = await getAppProps(ctx);
    const userSession = await getSession(ctx.req,ctx.res);
    console.log("User session:", userSession.user.sub);

    const client= await clientPromise;
    const db = client.db("BlogStandard");

    const user = await db.collection("users").findOne({
      auth0Id : userSession.user.sub,
    });
    console.log("User document from DB:", user);
    if(!user){
      console.log("No user found with the given auth0ID");
    }

    console.log("Looking for post with ID:", ctx.params.postid);
    const post = await db.collection("posts").findOne({
      _id: new ObjectId(ctx.params.postid),
      userId: user._id,

    })
    console.log("Post document from DB:", post);

    if(!post){
      console.log("No post found, redirecting to /post/new");
      return{
        redirect:{
          destination:"/post/new",
          permanent:false
        }
      }
    }


    return {
      props: {
        id: post._id.toString(),
        postContent: post.postContent,
        title: post.title,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        ...props,

      },
    };
  },
});
