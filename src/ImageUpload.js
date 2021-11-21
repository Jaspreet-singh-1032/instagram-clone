import { useState } from "react";
import { Button } from "@mui/material";
import firebase from "firebase/compat";
import React from "react";
import { db, storage } from "./firebase";
import "./ImageUpload.css";

function ImageUpload({ username }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      // console.log(e.target.files[0].size / 1024, "kb");
    }
  };
  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        //progress function
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        // error function
        console.log(error);
        alert(error.message);
      },
      () => {
        // complete function
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            // post image inside db
            db.collection("post").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              caption: caption,
              imageUrl: url,
              userName: username,
            });
            setProgress(0);
            setCaption("");
            setImage(null);
          });
      }
    );
  };
  return (
    <div className="imageupload">
      <progress
        className="imageupload__progress"
        value={progress}
        max="100"
      ></progress>
      <input type="file" onChange={handleChange} />
      <input
        type="text"
        value={caption}
        placeholder="Enter caption"
        onChange={(e) => setCaption(e.target.value)}
      />
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
}

export default ImageUpload;
