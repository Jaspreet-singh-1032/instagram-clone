import React, { useState, useEffect } from "react";
import "./Post.css";
import Avatar from "@mui/material/Avatar";
import { Button, Input } from "@mui/material";
import firebase from "firebase/compat";
import { db } from "./firebase";
function Post({ user, postId, avatar, userName, imageUrl, caption }) {
  const [comments, setComments] = useState([]); // fetched from firebase db
  const [comment, setComment] = useState(""); // entered by user

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (comment) {
      db.collection("post")
        .doc(postId)
        .collection("comments")
        .add({
          comment,
          userName: user.displayName,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .catch((error) => alert(error.message));
      setComment("");
    }
  };
  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection("post")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({
              commentId: doc.id,
              ...doc.data(), // returns {userName:"" , comment:""}
            }))
          );
        });
    }
    return () => {
      unsubscribe();
    };
  }, [postId]);
  return (
    <div className="post">
      <div className="post__header">
        <Avatar className="post__avatar" alt={userName} src={avatar} />
        <h3>{userName}</h3>
      </div>
      <img className="post__image" src={imageUrl} alt="" />
      <h4 className="post__text">
        <strong> {userName} :</strong> {caption}
      </h4>
      <div className="post__comments">
        {comments.map((item) => {
          return (
            <p key={item.commentId}>
              <b>{item.userName} : </b>
              {item.comment}
            </p>
          );
        })}
      </div>
      {user && (
        <form onSubmit={handleCommentSubmit} className="post__commentbox">
          <Input
            className="post__input"
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button className="post__button" type="submit" disabled={!comment}>
            post
          </Button>
        </form>
      )}
    </div>
  );
}

export default Post;
